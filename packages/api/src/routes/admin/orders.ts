import { db } from '@gemfolio/db';
import {
  addOrderAdminNotes,
  getOrderById,
  getOrderStatusHistory,
  getOrders,
  searchOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, paginated, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware, getUser } from '../../middleware/auth';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const updateStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
  note: z.string().max(500).optional(),
});

const updatePaymentSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
});

const addNoteSchema = z.object({
  note: z.string().min(1).max(1000),
});

export const adminOrdersRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/orders - List all orders with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      // If search is provided, use search function
      if (filters.search) {
        const results = await searchOrders(db, filters.search, filters.limit);
        return paginated(c, results, {
          page: 1,
          limit: filters.limit,
          total: results.length,
        });
      }

      const result = await getOrders(
        db,
        {
          status: filters.status,
          paymentStatus: filters.paymentStatus,
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        },
        { page: filters.page, limit: filters.limit },
        filters.sortDirection
      );

      return paginated(c, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/orders/:id - Get order by ID with full details
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const order = await getOrderById(db, id);

      if (!order) {
        return errors.notFound(c, 'Pedido');
      }

      // Also get status history
      const statusHistory = await getOrderStatusHistory(db, id);

      return success(c, {
        ...order,
        statusHistory,
      });
    } catch (err) {
      console.error('Error fetching order:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/orders/:id/status - Update order status
   */
  .patch('/:id/status', zValidator('json', updateStatusSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const user = getUser(c);

    try {
      const existing = await getOrderById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Pedido');
      }

      const order = await updateOrderStatus(db, id, data.status, data.note, user?.id);

      return success(c, order);
    } catch (err) {
      console.error('Error updating order status:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/orders/:id/payment - Update payment status
   */
  .patch('/:id/payment', zValidator('json', updatePaymentSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getOrderById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Pedido');
      }

      const order = await updatePaymentStatus(db, id, data.paymentStatus);

      return success(c, order);
    } catch (err) {
      console.error('Error updating payment status:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/orders/:id/notes - Add admin note to order
   */
  .post('/:id/notes', zValidator('json', addNoteSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getOrderById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Pedido');
      }

      // Append new note to existing notes
      const existingNotes = existing.adminNotes || '';
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${data.note}`;
      const combinedNotes = existingNotes ? `${existingNotes}\n\n${newNote}` : newNote;

      const order = await addOrderAdminNotes(db, id, combinedNotes);

      return success(c, order);
    } catch (err) {
      console.error('Error adding order note:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/orders/:id/history - Get order status history
   */
  .get('/:id/history', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getOrderById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Pedido');
      }

      const history = await getOrderStatusHistory(db, id);

      return success(c, history);
    } catch (err) {
      console.error('Error fetching order history:', err);
      return errors.serverError(c);
    }
  });
