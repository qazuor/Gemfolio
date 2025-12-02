import { db } from '@gemfolio/db';
import { getProductBySlug, getProducts, getRelatedProducts } from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, paginated, success } from '../lib/response';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export const productsRoutes = new Hono()
  /**
   * GET /products - List active products with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getProducts(
        db,
        {
          status: 'active',
          categoryId: filters.categoryId,
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          inStock: filters.inStock,
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
   * GET /products/:slug - Get product by slug
   */
  .get('/:slug', async (c) => {
    const slug = c.req.param('slug');

    try {
      const product = await getProductBySlug(db, slug);

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
   * GET /products/:slug/related - Get related products
   */
  .get('/:slug/related', async (c) => {
    const slug = c.req.param('slug');

    try {
      const product = await getProductBySlug(db, slug);

      if (!product) {
        return errors.notFound(c, 'Producto');
      }

      const related = await getRelatedProducts(db, product.id, '4');

      return success(c, related);
    } catch (err) {
      console.error('Error fetching related products:', err);
      return errors.serverError(c);
    }
  });
