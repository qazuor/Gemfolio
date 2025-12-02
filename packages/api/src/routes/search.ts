import { db } from '@gemfolio/db';
import { searchProducts } from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../lib/response';

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const searchRoutes = new Hono()
  /**
   * GET /search - Search products
   */
  .get('/', zValidator('query', searchSchema), async (c) => {
    const { q, limit } = c.req.valid('query');

    try {
      const results = await searchProducts(db, q, limit);
      return success(c, results);
    } catch (err) {
      console.error('Error searching products:', err);
      return errors.serverError(c);
    }
  });
