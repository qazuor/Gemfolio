import { db } from '@gemfolio/db';
import { getCategoryBySlug, getCategoryTreeWithCounts } from '@gemfolio/db/queries';
import { Hono } from 'hono';

import { errors, success } from '../lib/response';

export const categoriesRoutes = new Hono()
  /**
   * GET /categories - Get category tree with product counts
   */
  .get('/', async (c) => {
    try {
      const categories = await getCategoryTreeWithCounts(db);
      return success(c, categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /categories/:slug - Get category by slug with products
   */
  .get('/:slug', async (c) => {
    const slug = c.req.param('slug');

    try {
      const category = await getCategoryBySlug(db, slug, true);

      if (!category) {
        return errors.notFound(c, 'Categoría');
      }

      return success(c, category);
    } catch (err) {
      console.error('Error fetching category:', err);
      return errors.serverError(c);
    }
  });
