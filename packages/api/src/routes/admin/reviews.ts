import { db } from '@gemfolio/db';
import {
  addAdminResponse,
  deleteReview,
  getPendingReviews,
  getReviewById,
  getReviews,
  moderateReview,
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
  productId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxRating: z.coerce.number().min(1).max(5).optional(),
  isVerifiedPurchase: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});

const moderateSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  note: z.string().max(500).optional(),
});

const responseSchema = z.object({
  response: z.string().min(1).max(2000),
});

export const adminReviewsRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/reviews - List all reviews with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const query = c.req.valid('query');

    try {
      const { page, limit, ...filters } = query;
      const offset = (page - 1) * limit;

      const result = await getReviews(db, filters, { limit, offset });

      return paginated(c, result.items, {
        page,
        limit,
        total: result.total,
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/reviews/pending - Get pending reviews for moderation
   */
  .get(
    '/pending',
    zValidator(
      'query',
      z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
      })
    ),
    async (c) => {
      const { page, limit } = c.req.valid('query');

      try {
        const offset = (page - 1) * limit;
        const reviews = await getPendingReviews(db, { limit, offset });

        return success(c, reviews);
      } catch (err) {
        console.error('Error fetching pending reviews:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * GET /admin/reviews/:id - Get review by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const review = await getReviewById(db, id);

      if (!review) {
        return errors.notFound(c, 'Reseña');
      }

      return success(c, review);
    } catch (err) {
      console.error('Error fetching review:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/reviews/:id/moderate - Moderate a review (approve/reject)
   */
  .patch('/:id/moderate', zValidator('json', moderateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const user = getUser(c);

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const existing = await getReviewById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Reseña');
      }

      const review = await moderateReview(db, id, data.status, user.id, data.note);

      return success(c, review);
    } catch (err) {
      console.error('Error moderating review:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/reviews/:id/response - Add admin response to a review
   */
  .post('/:id/response', zValidator('json', responseSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const user = getUser(c);

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const existing = await getReviewById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Reseña');
      }

      const review = await addAdminResponse(db, id, data.response, user.id);

      return success(c, review);
    } catch (err) {
      console.error('Error adding admin response:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/reviews/:id - Delete a review
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getReviewById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Reseña');
      }

      await deleteReview(db, id);

      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting review:', err);
      return errors.serverError(c);
    }
  });
