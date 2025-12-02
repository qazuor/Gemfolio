import { db } from '@gemfolio/db';
import {
  createBundle,
  deleteBundle,
  getBundleById,
  getBundles,
  updateBundle,
  updateBundleItems,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, paginated, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const bundleItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).default(1),
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().nullable().optional(),
  price: z.string(),
  comparePrice: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  items: z.array(bundleItemSchema).min(2, 'Un bundle debe tener al menos 2 productos'),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().nullable().optional(),
  price: z.string().optional(),
  comparePrice: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  items: z.array(bundleItemSchema).min(2, 'Un bundle debe tener al menos 2 productos').optional(),
});

export const adminBundlesRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/bundles - List all bundles with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getBundles(
        db,
        {
          search: filters.search,
          status: filters.status,
        },
        { page: filters.page, limit: filters.limit },
        filters.sortBy,
        filters.sortDirection
      );

      return paginated(c, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } catch (err) {
      console.error('Error fetching bundles:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/bundles/:id - Get bundle by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const bundle = await getBundleById(db, id);

      if (!bundle) {
        return errors.notFound(c, 'Bundle');
      }

      return success(c, bundle);
    } catch (err) {
      console.error('Error fetching bundle:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/bundles - Create new bundle
   */
  .post('/', zValidator('json', createSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      const { items, validFrom, validUntil, ...bundleData } = data;

      const bundle = await createBundle(
        db,
        {
          ...bundleData,
          validFrom: validFrom ? new Date(validFrom) : null,
          validUntil: validUntil ? new Date(validUntil) : null,
        },
        items
      );

      return success(c, bundle, 201);
    } catch (err) {
      console.error('Error creating bundle:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/bundles/:id - Update bundle
   */
  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getBundleById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Bundle');
      }

      const { items, validFrom, validUntil, ...bundleData } = data;

      // Update bundle data
      const updateData: Record<string, unknown> = { ...bundleData };
      if (validFrom !== undefined) {
        updateData.validFrom = validFrom ? new Date(validFrom) : null;
      }
      if (validUntil !== undefined) {
        updateData.validUntil = validUntil ? new Date(validUntil) : null;
      }

      await updateBundle(db, id, updateData);

      // Update items if provided
      if (items) {
        await updateBundleItems(db, id, items);
      }

      // Fetch updated bundle with items
      const updatedBundle = await getBundleById(db, id);

      return success(c, updatedBundle);
    } catch (err) {
      console.error('Error updating bundle:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/bundles/:id - Delete bundle
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getBundleById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Bundle');
      }

      await deleteBundle(db, id);
      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting bundle:', err);
      return errors.serverError(c);
    }
  });
