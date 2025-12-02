import { type Cart, db } from '@gemfolio/db';
import {
  addCartItem,
  applyCouponToCart,
  clearCart,
  getCartById,
  getCartByUserId,
  getCartByVisitorId,
  getOrCreateUserCart,
  getOrCreateVisitorCart,
  removeCartItem,
  removeCouponFromCart,
  updateCartItemQuantity,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../lib/response';

const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0),
});

const couponSchema = z.object({
  code: z.string().min(1),
});

export const cartRoutes = new Hono()
  /**
   * POST /cart - Create or get cart
   * Body: { userId?: string, visitorId?: string }
   */
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        userId: z.string().optional(),
        visitorId: z.string().optional(),
      })
    ),
    async (c) => {
      const { userId, visitorId } = c.req.valid('json');

      try {
        let cart: Cart;
        if (userId) {
          cart = await getOrCreateUserCart(db, userId);
        } else if (visitorId) {
          cart = await getOrCreateVisitorCart(db, visitorId);
        } else {
          return errors.badRequest(c, 'Either userId or visitorId is required');
        }

        const fullCart = await getCartById(db, cart.id);
        return success(c, fullCart, 201);
      } catch (err) {
        console.error('Error creating cart:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * GET /cart/:id - Get cart by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const cart = await getCartById(db, id);

      if (!cart) {
        return errors.notFound(c, 'Cart');
      }

      return success(c, cart);
    } catch (err) {
      console.error('Error fetching cart:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /cart/user/:userId - Get cart by user ID
   */
  .get('/user/:userId', async (c) => {
    const userId = c.req.param('userId');

    try {
      const cart = await getCartByUserId(db, userId);

      if (!cart) {
        return success(c, null);
      }

      return success(c, cart);
    } catch (err) {
      console.error('Error fetching user cart:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /cart/visitor/:visitorId - Get cart by visitor ID
   */
  .get('/visitor/:visitorId', async (c) => {
    const visitorId = c.req.param('visitorId');

    try {
      const cart = await getCartByVisitorId(db, visitorId);

      if (!cart) {
        return success(c, null);
      }

      return success(c, cart);
    } catch (err) {
      console.error('Error fetching visitor cart:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /cart/:id/items - Add item to cart
   */
  .post('/:id/items', zValidator('json', addItemSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const cart = await getCartById(db, id);
      if (!cart) {
        return errors.notFound(c, 'Cart');
      }

      await addCartItem(db, id, data);
      const updatedCart = await getCartById(db, id);

      return success(c, updatedCart, 201);
    } catch (err) {
      console.error('Error adding item to cart:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /cart/:id/items/:itemId - Update item quantity
   */
  .patch('/:id/items/:itemId', zValidator('json', updateItemSchema), async (c) => {
    const id = c.req.param('id');
    const itemId = c.req.param('itemId');
    const { quantity } = c.req.valid('json');

    try {
      const cart = await getCartById(db, id);
      if (!cart) {
        return errors.notFound(c, 'Cart');
      }

      await updateCartItemQuantity(db, itemId, quantity);
      const updatedCart = await getCartById(db, id);

      return success(c, updatedCart);
    } catch (err) {
      console.error('Error updating cart item:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /cart/:id/items/:itemId - Remove item from cart
   */
  .delete('/:id/items/:itemId', async (c) => {
    const id = c.req.param('id');
    const itemId = c.req.param('itemId');

    try {
      const cart = await getCartById(db, id);
      if (!cart) {
        return errors.notFound(c, 'Cart');
      }

      await removeCartItem(db, itemId);
      const updatedCart = await getCartById(db, id);

      return success(c, updatedCart);
    } catch (err) {
      console.error('Error removing cart item:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /cart/:id - Clear cart
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const cart = await getCartById(db, id);
      if (!cart) {
        return errors.notFound(c, 'Cart');
      }

      await clearCart(db, id);
      const updatedCart = await getCartById(db, id);

      return success(c, updatedCart);
    } catch (err) {
      console.error('Error clearing cart:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /cart/:id/coupon - Apply coupon to cart
   */
  .post('/:id/coupon', zValidator('json', couponSchema), async (c) => {
    const id = c.req.param('id');
    const { code } = c.req.valid('json');

    try {
      const cart = await getCartById(db, id);
      if (!cart) {
        return errors.notFound(c, 'Cart');
      }

      // TODO: Validate coupon code exists and is valid
      await applyCouponToCart(db, id, code);
      const updatedCart = await getCartById(db, id);

      return success(c, updatedCart);
    } catch (err) {
      console.error('Error applying coupon:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /cart/:id/coupon - Remove coupon from cart
   */
  .delete('/:id/coupon', async (c) => {
    const id = c.req.param('id');

    try {
      const cart = await getCartById(db, id);
      if (!cart) {
        return errors.notFound(c, 'Cart');
      }

      await removeCouponFromCart(db, id);
      const updatedCart = await getCartById(db, id);

      return success(c, updatedCart);
    } catch (err) {
      console.error('Error removing coupon:', err);
      return errors.serverError(c);
    }
  });
