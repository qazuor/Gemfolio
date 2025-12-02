import { db } from '@gemfolio/db';
import { clearCart, createOrder, getCartById, getOrderByNumber } from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

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
});

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

      // Calculate totals
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

      // TODO: Calculate shipping based on settings
      const shippingCost = '0.00';

      // TODO: Calculate discount from coupon
      const discount = '0.00';

      const total = subtotal + Number.parseFloat(shippingCost) - Number.parseFloat(discount);

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
          shippingCost,
          discount,
          total: total.toFixed(2),
          couponCode: cart.couponCode,
          customerNotes: data.notes,
          status: 'pending',
          paymentStatus: 'pending',
        },
        orderItems
      );

      // Clear the cart
      await clearCart(db, data.cartId);

      return success(c, order, 201);
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
  );
