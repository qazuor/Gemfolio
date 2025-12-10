import { db } from '@gemfolio/db';
import { getProductReviewStats, getProductReviews, getReviewById } from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../lib/response';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const reviewsRoutes = new Hono()
  /**
   * GET /reviews/product/:productId - Get reviews for a product (public, approved only)
   */
  .get('/product/:productId', zValidator('query', querySchema), async (c) => {
    const productId = c.req.param('productId');
    const { limit, offset } = c.req.valid('query');

    try {
      const [reviews, stats] = await Promise.all([
        getProductReviews(db, productId, { limit, offset }),
        getProductReviewStats(db, productId),
      ]);

      return success(c, {
        reviews,
        stats,
      });
    } catch (err) {
      console.error('Error fetching product reviews:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /reviews/product/:productId/stats - Get review stats for a product
   */
  .get('/product/:productId/stats', async (c) => {
    const productId = c.req.param('productId');

    try {
      const stats = await getProductReviewStats(db, productId);
      return success(c, stats);
    } catch (err) {
      console.error('Error fetching review stats:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /reviews/:id - Get a single review by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const review = await getReviewById(db, id);

      if (!review) {
        return errors.notFound(c, 'Review');
      }

      // Only return approved reviews publicly
      if (review.status !== 'approved') {
        return errors.notFound(c, 'Review');
      }

      return success(c, review);
    } catch (err) {
      console.error('Error fetching review:', err);
      return errors.serverError(c);
    }
  });
