import { db } from '@gemfolio/db';
import {
  canUserReviewProduct,
  createReview,
  deleteReview,
  getReviewById,
  getUserReviews,
  getUserVote,
  removeVote,
  updateReview,
  voteOnReview,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { authMiddleware, getUser } from '../../middleware/auth';

const createReviewSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  content: z.string().min(10).max(5000),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(255).optional(),
  content: z.string().min(10).max(5000).optional(),
});

const voteSchema = z.object({
  isHelpful: z.boolean(),
});

export const customerReviewsRoutes = new Hono()
  // Apply auth middleware to all routes
  .use('*', authMiddleware)

  /**
   * GET /customer/reviews - Get user's reviews
   */
  .get('/', async (c) => {
    const user = getUser(c);

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const reviews = await getUserReviews(db, user.id);
      return success(c, reviews);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /customer/reviews/can-review/:productId - Check if user can review a product
   */
  .get('/can-review/:productId', async (c) => {
    const user = getUser(c);
    const productId = c.req.param('productId');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const canReview = await canUserReviewProduct(db, user.id, productId);
      return success(c, { canReview });
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /customer/reviews - Create a new review
   */
  .post('/', zValidator('json', createReviewSchema), async (c) => {
    const user = getUser(c);
    const data = c.req.valid('json');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      // Check if user can review this product
      const canReview = await canUserReviewProduct(db, user.id, data.productId);
      if (!canReview) {
        return errors.badRequest(c, 'Ya has dejado una reseña para este producto');
      }

      const review = await createReview(db, {
        ...data,
        userId: user.id,
        isVerifiedPurchase: !!data.orderId, // Mark as verified if order provided
        status: 'pending', // Requires moderation
      });

      return success(c, review, 201);
    } catch (err) {
      console.error('Error creating review:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /customer/reviews/:id - Update own review
   */
  .patch('/:id', zValidator('json', updateReviewSchema), async (c) => {
    const user = getUser(c);
    const id = c.req.param('id');
    const data = c.req.valid('json');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const existing = await getReviewById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Reseña');
      }

      // Only allow editing own reviews
      if (existing.userId !== user.id) {
        return errors.forbidden(c, 'No puedes editar esta reseña');
      }

      // Reset to pending if edited (requires re-moderation)
      const review = await updateReview(db, id, {
        ...data,
        status: 'pending',
      });

      return success(c, review);
    } catch (err) {
      console.error('Error updating review:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /customer/reviews/:id - Delete own review
   */
  .delete('/:id', async (c) => {
    const user = getUser(c);
    const id = c.req.param('id');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const existing = await getReviewById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Reseña');
      }

      // Only allow deleting own reviews
      if (existing.userId !== user.id) {
        return errors.forbidden(c, 'No puedes eliminar esta reseña');
      }

      await deleteReview(db, id);

      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting review:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /customer/reviews/:id/vote - Vote on a review
   */
  .post('/:id/vote', zValidator('json', voteSchema), async (c) => {
    const user = getUser(c);
    const id = c.req.param('id');
    const data = c.req.valid('json');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const existing = await getReviewById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Reseña');
      }

      // Can't vote on own review
      if (existing.userId === user.id) {
        return errors.badRequest(c, 'No puedes votar tu propia reseña');
      }

      const vote = await voteOnReview(db, {
        reviewId: id,
        userId: user.id,
        isHelpful: data.isHelpful,
      });

      return success(c, vote);
    } catch (err) {
      console.error('Error voting on review:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /customer/reviews/:id/vote - Remove vote from a review
   */
  .delete('/:id/vote', async (c) => {
    const user = getUser(c);
    const id = c.req.param('id');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const removed = await removeVote(db, user.id, id);

      if (!removed) {
        return errors.notFound(c, 'Voto');
      }

      return success(c, { removed: true });
    } catch (err) {
      console.error('Error removing vote:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /customer/reviews/:id/my-vote - Get user's vote on a review
   */
  .get('/:id/my-vote', async (c) => {
    const user = getUser(c);
    const id = c.req.param('id');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const vote = await getUserVote(db, user.id, id);
      return success(c, { vote });
    } catch (err) {
      console.error('Error fetching vote:', err);
      return errors.serverError(c);
    }
  });
