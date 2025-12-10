import { db } from '@gemfolio/db';
import {
  addOrderAdminNotes,
  addRefundNotes,
  adjustStock,
  createRefund,
  getOrderById,
  getOrderRefundedAmount,
  getOrderRefunds,
  getOrderStatusHistory,
  getOrders,
  getRefundById,
  searchOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateRefundStatus,
} from '@gemfolio/db/queries';
import { sendOrderStatusUpdate } from '@gemfolio/email';
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

const createRefundSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido'),
  reason: z.enum([
    'customer_request',
    'defective_product',
    'wrong_item',
    'not_as_described',
    'damaged_shipping',
    'other',
  ]),
  reasonDetails: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        orderItemId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
  adminNotes: z.string().max(1000).optional(),
});

const updateRefundStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'processing', 'completed', 'rejected']),
  rejectionReason: z.string().max(500).optional(),
});

const addRefundNoteSchema = z.object({
  adminNotes: z.string().min(1).max(1000),
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

      const previousStatus = existing.status;
      const order = await updateOrderStatus(db, id, data.status, data.note, user?.id);

      if (!order) {
        return errors.serverError(c);
      }

      // Restore stock if order is cancelled
      if (data.status === 'cancelled' && previousStatus !== 'cancelled') {
        for (const item of existing.items) {
          await adjustStock(db, {
            productId: item.snapshot.productId,
            variantId: item.snapshot.variantId,
            type: 'in',
            quantity: item.quantity,
            reason: `Pedido cancelado - ${existing.orderNumber}`,
            orderId: existing.id,
          });
        }
      }

      // Send email notification to customer for status changes
      const emailStatuses = ['processing', 'shipped', 'delivered', 'cancelled'] as const;
      if (emailStatuses.includes(data.status as (typeof emailStatuses)[number])) {
        const webUrl = process.env.WEB_URL || 'http://localhost:4321';

        // Send email asynchronously (don't block response)
        sendOrderStatusUpdate({
          to: existing.customerEmail,
          customerName: existing.customerName,
          orderNumber: existing.orderNumber,
          status: data.status as 'processing' | 'shipped' | 'delivered' | 'cancelled',
          orderUrl: `${webUrl}/mi-cuenta/pedidos/${existing.orderNumber}`,
          message: data.note,
          storeName: 'Gemfolio',
        }).catch((err) => {
          console.error('Error sending order status email:', err);
        });
      }

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
  })

  // ============================================
  // REFUNDS ENDPOINTS
  // ============================================

  /**
   * GET /admin/orders/:id/refunds - Get all refunds for an order
   */
  .get('/:id/refunds', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getOrderById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Pedido');
      }

      const orderRefunds = await getOrderRefunds(db, id);
      const refundedAmount = await getOrderRefundedAmount(db, id);

      return success(c, {
        refunds: orderRefunds,
        refundedAmount,
        orderTotal: existing.total,
        remainingToRefund: (
          Number.parseFloat(existing.total) - Number.parseFloat(refundedAmount)
        ).toFixed(2),
      });
    } catch (err) {
      console.error('Error fetching order refunds:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/orders/:id/refunds - Create a new refund for an order
   */
  .post('/:id/refunds', zValidator('json', createRefundSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const user = getUser(c);

    try {
      const existing = await getOrderById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Pedido');
      }

      // Check if order is paid
      if (existing.paymentStatus !== 'paid' && existing.paymentStatus !== 'refunded') {
        return errors.badRequest(c, 'Solo se pueden reembolsar pedidos pagados');
      }

      // Calculate already refunded amount
      const refundedAmount = await getOrderRefundedAmount(db, id);
      const remainingToRefund =
        Number.parseFloat(existing.total) - Number.parseFloat(refundedAmount);
      const requestedAmount = Number.parseFloat(data.amount);

      if (requestedAmount > remainingToRefund) {
        return errors.badRequest(
          c,
          `El monto solicitado excede el monto disponible para reembolso ($${remainingToRefund.toFixed(2)})`
        );
      }

      const refund = await createRefund(db, {
        orderId: id,
        amount: data.amount,
        reason: data.reason,
        reasonDetails: data.reasonDetails,
        items: data.items,
        adminNotes: data.adminNotes,
        processedBy: user?.id,
      });

      return success(c, refund, 201);
    } catch (err) {
      console.error('Error creating refund:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/orders/:orderId/refunds/:refundId - Get refund details
   */
  .get('/:orderId/refunds/:refundId', async (c) => {
    const orderId = c.req.param('orderId');
    const refundId = c.req.param('refundId');

    try {
      const existing = await getOrderById(db, orderId);

      if (!existing) {
        return errors.notFound(c, 'Pedido');
      }

      const refund = await getRefundById(db, refundId);

      if (!refund || refund.orderId !== orderId) {
        return errors.notFound(c, 'Reembolso');
      }

      return success(c, refund);
    } catch (err) {
      console.error('Error fetching refund:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/orders/:orderId/refunds/:refundId/status - Update refund status
   */
  .patch(
    '/:orderId/refunds/:refundId/status',
    zValidator('json', updateRefundStatusSchema),
    async (c) => {
      const orderId = c.req.param('orderId');
      const refundId = c.req.param('refundId');
      const data = c.req.valid('json');
      const user = getUser(c);

      try {
        const existing = await getOrderById(db, orderId);

        if (!existing) {
          return errors.notFound(c, 'Pedido');
        }

        const refund = await getRefundById(db, refundId);

        if (!refund || refund.orderId !== orderId) {
          return errors.notFound(c, 'Reembolso');
        }

        // Validate status transitions
        const validTransitions: Record<string, string[]> = {
          pending: ['approved', 'rejected'],
          approved: ['processing', 'rejected'],
          processing: ['completed', 'rejected'],
          completed: [],
          rejected: [],
        };

        if (!validTransitions[refund.status]?.includes(data.status)) {
          return errors.badRequest(
            c,
            `No se puede cambiar el estado de "${refund.status}" a "${data.status}"`
          );
        }

        if (data.status === 'rejected' && !data.rejectionReason) {
          return errors.badRequest(c, 'Se requiere una razón para rechazar el reembolso');
        }

        const updatedRefund = await updateRefundStatus(
          db,
          refundId,
          data.status,
          user?.id,
          data.rejectionReason
        );

        return success(c, updatedRefund);
      } catch (err) {
        console.error('Error updating refund status:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * POST /admin/orders/:orderId/refunds/:refundId/notes - Add notes to refund
   */
  .post('/:orderId/refunds/:refundId/notes', zValidator('json', addRefundNoteSchema), async (c) => {
    const orderId = c.req.param('orderId');
    const refundId = c.req.param('refundId');
    const data = c.req.valid('json');

    try {
      const existing = await getOrderById(db, orderId);

      if (!existing) {
        return errors.notFound(c, 'Pedido');
      }

      const refund = await getRefundById(db, refundId);

      if (!refund || refund.orderId !== orderId) {
        return errors.notFound(c, 'Reembolso');
      }

      // Append new note to existing notes
      const existingNotes = refund.adminNotes || '';
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${data.adminNotes}`;
      const combinedNotes = existingNotes ? `${existingNotes}\n\n${newNote}` : newNote;

      const updatedRefund = await addRefundNotes(db, refundId, combinedNotes);

      return success(c, updatedRefund);
    } catch (err) {
      console.error('Error adding refund note:', err);
      return errors.serverError(c);
    }
  });
