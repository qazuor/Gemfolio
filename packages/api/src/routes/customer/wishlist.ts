import { db } from '@gemfolio/db';
import {
  addToWishlist,
  clearWishlist,
  getUserWishlist,
  getWishlistProductIds,
  isInWishlist,
  removeFromWishlist,
  toggleWishlist,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { authMiddleware, getUser } from '../../middleware/auth';

const addToWishlistSchema = z.object({
  productId: z.string().min(1),
});

export const customerWishlistRoutes = new Hono()
  // Apply auth middleware to all routes
  .use('*', authMiddleware)

  /**
   * GET /customer/wishlist - Get user's wishlist
   */
  .get('/', async (c) => {
    const user = getUser(c);

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const wishlist = await getUserWishlist(db, user.id);
      return success(c, wishlist);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /customer/wishlist/ids - Get wishlist product IDs (for quick UI checks)
   */
  .get('/ids', async (c) => {
    const user = getUser(c);

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const ids = await getWishlistProductIds(db, user.id);
      return success(c, { productIds: ids });
    } catch (err) {
      console.error('Error fetching wishlist IDs:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /customer/wishlist/check/:productId - Check if product is in wishlist
   */
  .get('/check/:productId', async (c) => {
    const user = getUser(c);
    const productId = c.req.param('productId');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const inWishlist = await isInWishlist(db, user.id, productId);
      return success(c, { inWishlist });
    } catch (err) {
      console.error('Error checking wishlist:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /customer/wishlist - Add product to wishlist
   */
  .post('/', zValidator('json', addToWishlistSchema), async (c) => {
    const user = getUser(c);
    const data = c.req.valid('json');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const wishlistItem = await addToWishlist(db, {
        userId: user.id,
        productId: data.productId,
      });

      return success(c, wishlistItem, 201);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /customer/wishlist/toggle - Toggle product in wishlist
   */
  .post('/toggle', zValidator('json', addToWishlistSchema), async (c) => {
    const user = getUser(c);
    const data = c.req.valid('json');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const result = await toggleWishlist(db, user.id, data.productId);
      return success(c, result);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /customer/wishlist/:productId - Remove product from wishlist
   */
  .delete('/:productId', async (c) => {
    const user = getUser(c);
    const productId = c.req.param('productId');

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const removed = await removeFromWishlist(db, user.id, productId);

      if (!removed) {
        return errors.notFound(c, 'Producto no encontrado en wishlist');
      }

      return success(c, { removed: true });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /customer/wishlist - Clear entire wishlist
   */
  .delete('/', async (c) => {
    const user = getUser(c);

    if (!user) {
      return errors.unauthorized(c);
    }

    try {
      const count = await clearWishlist(db, user.id);
      return success(c, { cleared: true, itemsRemoved: count });
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      return errors.serverError(c);
    }
  });
