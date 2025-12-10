import { db } from '@gemfolio/db';
import {
  adjustStock,
  calculateDiscount,
  clearCart,
  createOrder,
  getCartById,
  type getCouponByCode,
  getOrderByNumber,
  getSettingsByGroup,
  incrementCouponUsage,
  validateCoupon,
} from '@gemfolio/db/queries';
import type { ShippingSettings } from '@gemfolio/db/schema';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { createPreference, isMercadoPagoConfigured } from '../lib/mercadopago';
import { errors, success } from '../lib/response';

const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('Argentina'),
});

const createOrderSchema = z.object({
  cartId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().optional(),
  userId: z.string().optional(),
  couponCode: z.string().optional(),
});

/**
 * Calculate shipping cost based on settings
 */
async function calculateShipping(subtotal: number): Promise<number> {
  try {
    const shippingSettings = await getSettingsByGroup(db, 'shipping');
    const setting = shippingSettings.find((s) => s.key === 'shipping');

    if (setting?.value) {
      const config = setting.value as ShippingSettings;

      // Check for free shipping threshold
      if (config.freeShippingThreshold && subtotal >= config.freeShippingThreshold) {
        return 0;
      }

      // Return flat rate
      return config.flatRate || 0;
    }

    return 0;
  } catch {
    return 0;
  }
}

export const ordersRoutes = new Hono()
  /**
   * POST /orders - Create a new order from cart (checkout)
   */
  .post('/', zValidator('json', createOrderSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      // Get the cart
      const cart = await getCartById(db, data.cartId);
      if (!cart) {
        return errors.notFound(c, 'Cart');
      }

      if (cart.items.length === 0) {
        return errors.badRequest(c, 'Cart is empty');
      }

      // Calculate subtotal
      let subtotal = 0;
      const orderItems = cart.items
        .filter((item) => item.product)
        .map((item) => {
          const price = item.variant?.price ?? item.product!.price;
          const priceNum = Number.parseFloat(price);
          const itemTotal = priceNum * item.quantity;
          subtotal += itemTotal;

          return {
            snapshot: {
              productId: item.product!.id,
              productName: item.product!.name,
              variantId: item.variant?.id,
              variantName: item.variant?.name,
              sku: item.variant?.sku ?? item.product!.slug,
              price,
              image: item.product!.image ?? undefined,
            },
            quantity: item.quantity,
            unitPrice: priceNum.toFixed(2),
            totalPrice: itemTotal.toFixed(2),
          };
        });

      // Calculate shipping
      const shippingCost = await calculateShipping(subtotal);

      // Calculate discount from coupon
      let discount = 0;
      let couponCode: string | undefined;
      let appliedCoupon: Awaited<ReturnType<typeof getCouponByCode>> = null;
      let freeShipping = false;

      // Use cart coupon or provided coupon
      const couponToApply = data.couponCode || cart.couponCode;

      if (couponToApply) {
        const validation = await validateCoupon(db, couponToApply, subtotal);
        if (validation.valid && validation.coupon) {
          appliedCoupon = validation.coupon;
          couponCode = validation.coupon.code;

          if (validation.coupon.type === 'free_shipping') {
            freeShipping = true;
          } else {
            discount = calculateDiscount(validation.coupon, subtotal);
          }
        }
      }

      // Final shipping (0 if free shipping coupon)
      const finalShipping = freeShipping ? 0 : shippingCost;

      // Calculate total
      const total = subtotal + finalShipping - discount;

      // Create the order
      const order = await createOrder(
        db,
        {
          userId: data.userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress ?? data.shippingAddress,
          subtotal: subtotal.toFixed(2),
          shippingCost: finalShipping.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          couponCode,
          couponDiscount: discount > 0 ? discount.toFixed(2) : undefined,
          customerNotes: data.notes,
          status: 'pending',
          paymentStatus: 'pending',
        },
        orderItems
      );

      // Increment coupon usage
      if (appliedCoupon) {
        await incrementCouponUsage(db, appliedCoupon.id);
      }

      // Decrement inventory for each item
      for (const item of cart.items) {
        if (item.product) {
          if (item.variant) {
            // Variant has stock, decrement variant stock
            await adjustStock(db, {
              productId: item.product.id,
              variantId: item.variant.id,
              type: 'out',
              quantity: -item.quantity,
              reason: `Venta - Pedido ${order.orderNumber}`,
              orderId: order.id,
            });
          } else {
            // Product without variant, decrement product stock
            await adjustStock(db, {
              productId: item.product.id,
              type: 'out',
              quantity: -item.quantity,
              reason: `Venta - Pedido ${order.orderNumber}`,
              orderId: order.id,
            });
          }
        }
      }

      // Clear the cart
      await clearCart(db, data.cartId);

      // Create Mercado Pago preference if configured
      let paymentUrl: string | undefined;
      let preferenceId: string | undefined;

      if (isMercadoPagoConfigured()) {
        try {
          const preference = await createPreference({
            items: orderItems.map((item) => ({
              id: item.snapshot.productId,
              title: item.snapshot.productName,
              description: item.snapshot.variantName
                ? `${item.snapshot.productName} - ${item.snapshot.variantName}`
                : item.snapshot.productName,
              quantity: item.quantity,
              unit_price: Number.parseFloat(item.unitPrice),
              picture_url: item.snapshot.image,
            })),
            payer: {
              name: data.customerName,
              email: data.customerEmail,
              phone: data.customerPhone ? { number: data.customerPhone } : undefined,
            },
            external_reference: order.orderNumber,
          });

          paymentUrl =
            process.env.NODE_ENV === 'production'
              ? preference.init_point
              : preference.sandbox_init_point;
          preferenceId = preference.id;

          // Store preference ID in order metadata
          await db
            .update(await import('@gemfolio/db/schema').then((m) => m.orders))
            .set({
              paymentMetadata: { preferenceId },
            })
            .where(
              (await import('drizzle-orm').then((m) => m.eq))(
                (await import('@gemfolio/db/schema').then((m) => m.orders)).id,
                order.id
              )
            );
        } catch (err) {
          console.error('Error creating Mercado Pago preference:', err);
          // Continue without payment URL - order is still created
        }
      }

      return success(
        c,
        {
          ...order,
          paymentUrl,
          preferenceId,
        },
        201
      );
    } catch (err) {
      console.error('Error creating order:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /orders/:orderNumber - Get order by order number
   * Query: ?email=customer@example.com (for verification)
   */
  .get(
    '/:orderNumber',
    zValidator(
      'query',
      z.object({
        email: z.string().email().optional(),
      })
    ),
    async (c) => {
      const orderNumber = c.req.param('orderNumber');
      const { email } = c.req.valid('query');

      try {
        const order = await getOrderByNumber(db, orderNumber);

        if (!order) {
          return errors.notFound(c, 'Order');
        }

        // If email is provided, verify it matches
        if (email && order.customerEmail.toLowerCase() !== email.toLowerCase()) {
          return errors.unauthorized(c, 'Email does not match order');
        }

        // Return limited info for public access
        return success(c, {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items: order.items,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          discount: order.discount,
          total: order.total,
          createdAt: order.createdAt,
        });
      } catch (err) {
        console.error('Error fetching order:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * POST /orders/:orderNumber/retry-payment - Retry payment for pending order
   */
  .post('/:orderNumber/retry-payment', async (c) => {
    const orderNumber = c.req.param('orderNumber');

    try {
      const order = await getOrderByNumber(db, orderNumber);

      if (!order) {
        return errors.notFound(c, 'Order');
      }

      if (order.paymentStatus !== 'pending') {
        return errors.badRequest(c, 'Order payment is not pending');
      }

      if (!isMercadoPagoConfigured()) {
        return errors.badRequest(c, 'Payment system not configured');
      }

      // Create new preference
      const preference = await createPreference({
        items: order.items.map((item) => ({
          id: item.snapshot.productId,
          title: item.snapshot.productName,
          description: item.snapshot.variantName
            ? `${item.snapshot.productName} - ${item.snapshot.variantName}`
            : item.snapshot.productName,
          quantity: item.quantity,
          unit_price: Number.parseFloat(item.unitPrice),
          picture_url: item.snapshot.image,
        })),
        payer: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone ? { number: order.customerPhone } : undefined,
        },
        external_reference: order.orderNumber,
      });

      const paymentUrl =
        process.env.NODE_ENV === 'production'
          ? preference.init_point
          : preference.sandbox_init_point;

      return success(c, {
        paymentUrl,
        preferenceId: preference.id,
      });
    } catch (err) {
      console.error('Error creating retry payment:', err);
      return errors.serverError(c);
    }
  });
