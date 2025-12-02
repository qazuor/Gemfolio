import { db } from '@gemfolio/db';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryTree,
  reorderCategories,
  updateCategory,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().default(0),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const updateSchema = createSchema.partial();

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
      parentId: z.string().nullable().optional(),
    })
  ),
});

export const adminCategoriesRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/categories - List all categories
   */
  .get('/', async (c) => {
    try {
      const categories = await getCategoryTree(db);
      return success(c, categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/categories/:id - Get category by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const category = await getCategoryById(db, id);

      if (!category) {
        return errors.notFound(c, 'Categoría');
      }

      return success(c, category);
    } catch (err) {
      console.error('Error fetching category:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/categories - Create new category
   */
  .post('/', zValidator('json', createSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      const category = await createCategory(db, data);
      return success(c, category, 201);
    } catch (err) {
      console.error('Error creating category:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/categories/:id - Update category
   */
  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getCategoryById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Categoría');
      }

      const category = await updateCategory(db, id, data);
      return success(c, category);
    } catch (err) {
      console.error('Error updating category:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/categories/:id - Delete category
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getCategoryById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Categoría');
      }

      await deleteCategory(db, id);
      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting category:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/categories/reorder - Reorder categories
   */
  .patch('/reorder', zValidator('json', reorderSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      await reorderCategories(db, data.items);
      return success(c, { reordered: true });
    } catch (err) {
      console.error('Error reordering categories:', err);
      return errors.serverError(c);
    }
  });
