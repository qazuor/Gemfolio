import { db } from '@gemfolio/db';
import { createPage, deletePage, getPageById, getPages, updatePage } from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, paginated, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['draft', 'published']).optional(),
});

const createSchema = z.object({
  slug: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  content: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

const updateSchema = createSchema.partial();

export const adminPagesRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/pages - List all pages
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getPages(
        db,
        { status: filters.status },
        { page: filters.page, limit: filters.limit }
      );

      return paginated(c, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } catch (err) {
      console.error('Error fetching pages:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/pages/:id - Get page by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const page = await getPageById(db, id);

      if (!page) {
        return errors.notFound(c, 'Página');
      }

      return success(c, page);
    } catch (err) {
      console.error('Error fetching page:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/pages - Create new page
   */
  .post('/', zValidator('json', createSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      const page = await createPage(db, data);
      return success(c, page, 201);
    } catch (err) {
      console.error('Error creating page:', err);
      // Check for duplicate slug error
      if (err instanceof Error && err.message.includes('unique')) {
        return errors.badRequest(c, 'Ya existe una página con este slug');
      }
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/pages/:id - Update page
   */
  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getPageById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Página');
      }

      const page = await updatePage(db, id, data);

      return success(c, page);
    } catch (err) {
      console.error('Error updating page:', err);
      if (err instanceof Error && err.message.includes('unique')) {
        return errors.badRequest(c, 'Ya existe una página con este slug');
      }
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/pages/:id - Delete page
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getPageById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Página');
      }

      await deletePage(db, id);
      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting page:', err);
      return errors.serverError(c);
    }
  });
