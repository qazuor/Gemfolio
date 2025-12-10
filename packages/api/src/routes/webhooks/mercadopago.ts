import { db } from '@gemfolio/db';
import { updateOrderPaymentStatus, updateOrderStatus } from '@gemfolio/db/queries';
import { sendNewOrderAdmin, sendOrderConfirmation } from '@gemfolio/email';
import { Hono } from 'hono';

import { getPayment, mapPaymentStatus, verifyWebhookSignature } from '../../lib/mercadopago';

export const mercadopagoWebhookRoutes = new Hono()
  /**
   * POST /webhooks/mercadopago - Handle Mercado Pago webhooks
   */
  .post('/', async (c) => {
    try {
      const body = await c.req.json();
      const xSignature = c.req.header('x-signature') || '';
      const xRequestId = c.req.header('x-request-id') || '';

      // Verify webhook signature in production
      if (process.env.NODE_ENV === 'production' && body.data?.id) {
        const isValid = verifyWebhookSignature(xSignature, xRequestId, body.data.id);
        if (!isValid) {
          console.error('Invalid webhook signature');
          return c.json({ error: 'Invalid signature' }, 401);
        }
      }

      // Handle different webhook types
      if (body.type === 'payment') {
        const paymentId = body.data?.id;

        if (!paymentId) {
          console.error('No payment ID in webhook');
          return c.json({ error: 'No payment ID' }, 400);
        }

        // Get payment details from Mercado Pago
        const paymentInfo = await getPayment(Number(paymentId));

        if (!paymentInfo) {
          console.error('Could not fetch payment info:', paymentId);
          return c.json({ error: 'Payment not found' }, 404);
        }

        // The external_reference is our order number
        const orderNumber = paymentInfo.external_reference;

        if (!orderNumber) {
          console.error('No order number in payment external_reference');
          return c.json({ error: 'No order reference' }, 400);
        }

        // Map MP status to our status
        const paymentStatus = mapPaymentStatus(paymentInfo.status);

        // Update order payment status
        const order = await updateOrderPaymentStatus(db, orderNumber, paymentStatus, {
          mpPaymentId: String(paymentInfo.id),
          mpStatus: paymentInfo.status,
          mpStatusDetail: paymentInfo.status_detail,
          mpPaymentMethod: paymentInfo.payment_method_id,
          mpPaymentType: paymentInfo.payment_type_id,
          mpDateApproved: paymentInfo.date_approved,
        });

        if (!order) {
          console.error('Order not found:', orderNumber);
          return c.json({ error: 'Order not found' }, 404);
        }

        // If payment was approved, send confirmation emails and update status
        if (paymentStatus === 'paid') {
          // Update order status to processing
          await updateOrderStatus(db, order.id, 'processing', 'Pago confirmado');

          // Send emails
          await sendOrderEmails(order);
        }

        console.log(`Payment webhook processed: Order ${orderNumber}, Status: ${paymentStatus}`);
        return c.json({ success: true });
      }

      // Log unhandled webhook types
      console.log('Unhandled webhook type:', body.type);
      return c.json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return c.json({ error: 'Internal error' }, 500);
    }
  });

/**
 * Send order confirmation emails
 */
async function sendOrderEmails(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    snapshot: {
      productName: string;
      price: string;
      image?: string;
    };
    quantity: number;
  }>;
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
}) {
  const webUrl = process.env.WEB_URL || 'http://localhost:4321';
  const adminUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';

  try {
    // Send confirmation to customer
    await sendOrderConfirmation({
      to: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt.toLocaleDateString('es-AR'),
      items: order.items.map((item) => ({
        name: item.snapshot.productName,
        quantity: item.quantity,
        price: Number.parseFloat(item.snapshot.price),
        imageUrl: item.snapshot.image,
      })),
      subtotal: Number.parseFloat(order.subtotal),
      shipping: Number.parseFloat(order.shippingCost),
      tax: 0,
      total: Number.parseFloat(order.total),
      shippingAddress: {
        line1: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      },
      orderUrl: `${webUrl}/mi-cuenta/pedidos/${order.orderNumber}`,
      storeName: 'Gemfolio',
    });

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gemfolio.com';
    await sendNewOrderAdmin({
      to: adminEmail,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt.toLocaleDateString('es-AR'),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((item) => ({
        name: item.snapshot.productName,
        quantity: item.quantity,
        price: Number.parseFloat(item.snapshot.price),
      })),
      subtotal: Number.parseFloat(order.subtotal),
      shipping: Number.parseFloat(order.shippingCost),
      tax: 0,
      total: Number.parseFloat(order.total),
      shippingAddress: {
        line1: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      },
      adminOrderUrl: `${adminUrl}/pedidos/${order.id}`,
      storeName: 'Gemfolio',
    });

    console.log(`Emails sent for order ${order.orderNumber}`);
  } catch (error) {
    console.error('Error sending order emails:', error);
    // Don't throw - emails are not critical to order processing
  }
}
