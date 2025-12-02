import { db } from '@gemfolio/db';
import { getActiveBundles, getBundleBySlug } from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../lib/response';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const bundlesRoutes = new Hono()
  /**
   * GET /bundles - List active bundles
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const { limit } = c.req.valid('query');

    try {
      const bundles = await getActiveBundles(db, limit);
      return success(c, bundles);
    } catch (err) {
      console.error('Error fetching bundles:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /bundles/:slug - Get bundle by slug
   */
  .get('/:slug', async (c) => {
    const slug = c.req.param('slug');

    try {
      const bundle = await getBundleBySlug(db, slug, true);

      if (!bundle) {
        return errors.notFound(c, 'Bundle');
      }

      return success(c, bundle);
    } catch (err) {
      console.error('Error fetching bundle:', err);
      return errors.serverError(c);
    }
  });
