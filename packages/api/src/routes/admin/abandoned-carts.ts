import { db } from '@gemfolio/db';
import {
  deleteAbandonedCart,
  expireOldAbandonedCarts,
  getAbandonedCartById,
  getAbandonedCartStats,
  getAbandonedCarts,
  getCartsForFollowUpEmail,
  getCartsForRecoveryEmail,
  markRecoveryEmailSent,
  updateAbandonedCart,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, paginated, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .enum(['pending', 'email_sent', 'follow_up_sent', 'recovered', 'expired', 'unsubscribed'])
    .optional(),
  isRecovered: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  minTotal: z.coerce.number().optional(),
  maxTotal: z.coerce.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  hasEmail: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});

const statsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const updateSchema = z.object({
  status: z
    .enum(['pending', 'email_sent', 'follow_up_sent', 'recovered', 'expired', 'unsubscribed'])
    .optional(),
  discountCode: z.string().optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
});

export const adminAbandonedCartsRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/abandoned-carts - List abandoned carts with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const query = c.req.valid('query');

    try {
      const { page, limit, startDate, endDate, ...filters } = query;
      const offset = (page - 1) * limit;

      const result = await getAbandonedCarts(
        db,
        {
          ...filters,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
        { limit, offset }
      );

      return paginated(c, result.items, {
        page,
        limit,
        total: result.total,
      });
    } catch (err) {
      console.error('Error fetching abandoned carts:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/abandoned-carts/stats - Get abandoned cart statistics
   */
  .get('/stats', zValidator('query', statsQuerySchema), async (c) => {
    const { startDate, endDate } = c.req.valid('query');

    try {
      const stats = await getAbandonedCartStats(db, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      return success(c, stats);
    } catch (err) {
      console.error('Error fetching abandoned cart stats:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/abandoned-carts/pending-recovery - Get carts ready for recovery email
   */
  .get('/pending-recovery', async (c) => {
    try {
      const carts = await getCartsForRecoveryEmail(db, { limit: 50 });
      return success(c, carts);
    } catch (err) {
      console.error('Error fetching carts for recovery:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/abandoned-carts/pending-follow-up - Get carts ready for follow-up email
   */
  .get('/pending-follow-up', async (c) => {
    try {
      const carts = await getCartsForFollowUpEmail(db, { limit: 50 });
      return success(c, carts);
    } catch (err) {
      console.error('Error fetching carts for follow-up:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/abandoned-carts/:id - Get abandoned cart by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const cart = await getAbandonedCartById(db, id);

      if (!cart) {
        return errors.notFound(c, 'Carrito abandonado');
      }

      return success(c, cart);
    } catch (err) {
      console.error('Error fetching abandoned cart:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/abandoned-carts/:id - Update an abandoned cart
   */
  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getAbandonedCartById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Carrito abandonado');
      }

      const cart = await updateAbandonedCart(db, id, data);

      return success(c, cart);
    } catch (err) {
      console.error('Error updating abandoned cart:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/abandoned-carts/:id/send-recovery - Mark recovery email as sent
   */
  .post('/:id/send-recovery', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getAbandonedCartById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Carrito abandonado');
      }

      if (existing.isRecovered) {
        return errors.badRequest(c, 'Este carrito ya fue recuperado');
      }

      const cart = await markRecoveryEmailSent(db, id);

      return success(c, cart);
    } catch (err) {
      console.error('Error marking recovery email sent:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/abandoned-carts/expire-old - Expire old abandoned carts
   */
  .post('/expire-old', async (c) => {
    try {
      const count = await expireOldAbandonedCarts(db);
      return success(c, { expired: count });
    } catch (err) {
      console.error('Error expiring old carts:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/abandoned-carts/:id - Delete an abandoned cart record
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getAbandonedCartById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Carrito abandonado');
      }

      await deleteAbandonedCart(db, id);

      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting abandoned cart:', err);
      return errors.serverError(c);
    }
  });
