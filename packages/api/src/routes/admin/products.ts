import { db } from '@gemfolio/db';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
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
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  categoryId: z.string().optional(),
  stock: z.number().default(0),
  isFeatured: z.boolean().default(false),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const adminProductsRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/products - List all products with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getProducts(
        db,
        {
          search: filters.search,
          categoryId: filters.categoryId,
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
      console.error('Error fetching products:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/products/:id - Get product by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const product = await getProductById(db, id);

      if (!product) {
        return errors.notFound(c, 'Producto');
      }

      return success(c, product);
    } catch (err) {
      console.error('Error fetching product:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/products - Create new product
   */
  .post('/', zValidator('json', createSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      const product = await createProduct(db, data);
      return success(c, product, 201);
    } catch (err) {
      console.error('Error creating product:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/products/:id - Update product
   */
  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getProductById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Producto');
      }

      const product = await updateProduct(db, id, data);
      return success(c, product);
    } catch (err) {
      console.error('Error updating product:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/products/:id - Delete product
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getProductById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Producto');
      }

      await deleteProduct(db, id);
      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting product:', err);
      return errors.serverError(c);
    }
  });
