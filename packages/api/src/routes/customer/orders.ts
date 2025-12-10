import { db } from '@gemfolio/db';
import { getOrderById, getOrderStatusHistory, getUserOrders } from '@gemfolio/db/queries';
import { Hono } from 'hono';

import { errors, success } from '../../lib/response';
import { authMiddleware, getUser } from '../../middleware/auth';

export const customerOrdersRoutes = new Hono()
  // Apply only auth middleware (not admin)
  .use('*', authMiddleware)

  /**
   * GET /customer/orders - Get current user's orders
   */
  .get('/', async (c) => {
    const currentUser = getUser(c);

    try {
      const result = await getUserOrders(db, currentUser.id, { page: 1, limit: 100 });

      // Transform orders to a simpler format for the customer
      const orders = result.items.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        // Calculate item count from items if we have them, otherwise use a default
        itemCount: 0, // Will be calculated from order items
        createdAt: order.createdAt.toISOString(),
      }));

      return success(c, orders);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /customer/orders/:id - Get specific order details
   */
  .get('/:id', async (c) => {
    const currentUser = getUser(c);
    const orderId = c.req.param('id');

    try {
      const order = await getOrderById(db, orderId);

      if (!order) {
        return errors.notFound(c, 'Pedido');
      }

      // Verify that this order belongs to the current user
      if (order.userId !== currentUser.id) {
        return errors.forbidden(c, 'No tienes acceso a este pedido');
      }

      // Get status history
      const statusHistory = await getOrderStatusHistory(db, orderId);

      // Transform to customer-friendly format
      const orderDetail = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shipping: Number(order.shippingCost),
        discount: Number(order.discount),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        shippingAddress: order.shippingAddress
          ? {
              name: order.shippingAddress.fullName,
              address: order.shippingAddress.address,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              zipCode: order.shippingAddress.postalCode,
              country: order.shippingAddress.country,
              phone: order.shippingAddress.phone || null,
            }
          : null,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.snapshot.productId,
          productName: item.snapshot.productName,
          productImage: item.snapshot.image || null,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          total: Number(item.totalPrice),
        })),
        timeline: statusHistory.map((entry) => ({
          status: entry.status,
          date: entry.createdAt.toISOString(),
          note: entry.note,
        })),
      };

      return success(c, orderDetail);
    } catch (err) {
      console.error('Error fetching customer order:', err);
      return errors.serverError(c);
    }
  });
