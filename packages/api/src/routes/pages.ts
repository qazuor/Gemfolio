import { db } from '@gemfolio/db';
import { getPageBySlug } from '@gemfolio/db/queries';
import { Hono } from 'hono';

import { errors, success } from '../lib/response';

export const pagesRoutes = new Hono()
  /**
   * GET /pages/:slug - Get page by slug (published only)
   */
  .get('/:slug', async (c) => {
    const slug = c.req.param('slug');

    try {
      const page = await getPageBySlug(db, slug, true);

      if (!page) {
        return errors.notFound(c, 'Page');
      }

      return success(c, page);
    } catch (err) {
      console.error('Error fetching page:', err);
      return errors.serverError(c);
    }
  });
