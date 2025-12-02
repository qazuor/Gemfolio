import { db } from '@gemfolio/db';
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  toggleCouponStatus,
  updateCoupon,
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
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  type: z.enum(['percentage', 'fixed', 'free_shipping']).optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const createSchema = z.object({
  code: z.string().min(3).max(50),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.string(),
  minimumPurchase: z.string().nullable().optional(),
  maximumDiscount: z.string().nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  usagePerUser: z.number().int().min(1).nullable().optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
});

const updateSchema = createSchema.partial();

export const adminCouponsRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/coupons - List all coupons with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getCoupons(
        db,
        {
          search: filters.search,
          isActive: filters.isActive,
          type: filters.type,
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
      console.error('Error fetching coupons:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/coupons/:id - Get coupon by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const coupon = await getCouponById(db, id);

      if (!coupon) {
        return errors.notFound(c, 'Cupón');
      }

      return success(c, coupon);
    } catch (err) {
      console.error('Error fetching coupon:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/coupons - Create new coupon
   */
  .post('/', zValidator('json', createSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      const coupon = await createCoupon(db, {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      });

      return success(c, coupon, 201);
    } catch (err) {
      console.error('Error creating coupon:', err);
      // Check for duplicate code error
      if (err instanceof Error && err.message.includes('unique')) {
        return errors.badRequest(c, 'Ya existe un cupón con este código');
      }
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/coupons/:id - Update coupon
   */
  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getCouponById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Cupón');
      }

      const updateData: Record<string, unknown> = { ...data };
      if (data.validFrom !== undefined) {
        updateData.validFrom = data.validFrom ? new Date(data.validFrom) : null;
      }
      if (data.validUntil !== undefined) {
        updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
      }

      const coupon = await updateCoupon(db, id, updateData);

      return success(c, coupon);
    } catch (err) {
      console.error('Error updating coupon:', err);
      if (err instanceof Error && err.message.includes('unique')) {
        return errors.badRequest(c, 'Ya existe un cupón con este código');
      }
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/coupons/:id - Delete coupon
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getCouponById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Cupón');
      }

      await deleteCoupon(db, id);
      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting coupon:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/coupons/:id/toggle - Toggle coupon active status
   */
  .post('/:id/toggle', async (c) => {
    const id = c.req.param('id');

    try {
      const coupon = await toggleCouponStatus(db, id);

      if (!coupon) {
        return errors.notFound(c, 'Cupón');
      }

      return success(c, coupon);
    } catch (err) {
      console.error('Error toggling coupon status:', err);
      return errors.serverError(c);
    }
  });
