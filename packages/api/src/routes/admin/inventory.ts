import { db } from '@gemfolio/db';
import {
  adjustStock,
  getInventoryMovements,
  getInventoryStock,
  getLowStockCount,
  getLowStockItems,
  getProductMovementHistory,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, paginated, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware, getUser } from '../../middleware/auth';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  lowStockOnly: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

const movementsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  productId: z.string().optional(),
  variantId: z.string().optional(),
  type: z.enum(['in', 'out', 'adjustment', 'return']).optional(),
});

const adjustSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  type: z.enum(['in', 'out', 'adjustment', 'return']),
  quantity: z.number().int(),
  reason: z.string().optional(),
});

export const adminInventoryRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/inventory - Get inventory stock view
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getInventoryStock(
        db,
        {
          lowStockOnly: filters.lowStockOnly,
          search: filters.search,
        },
        { page: filters.page, limit: filters.limit }
      );

      return paginated(c, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } catch (err) {
      console.error('Error fetching inventory:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/inventory/low-stock - Get low stock alerts
   */
  .get('/low-stock', async (c) => {
    try {
      const [count, items] = await Promise.all([getLowStockCount(db), getLowStockItems(db, 20)]);

      return success(c, {
        count,
        items,
      });
    } catch (err) {
      console.error('Error fetching low stock:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/inventory/movements - Get inventory movement history
   */
  .get('/movements', zValidator('query', movementsQuerySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getInventoryMovements(
        db,
        {
          productId: filters.productId,
          variantId: filters.variantId,
          type: filters.type,
        },
        { page: filters.page, limit: filters.limit }
      );

      return paginated(c, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } catch (err) {
      console.error('Error fetching inventory movements:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/inventory/product/:id - Get movement history for a product
   */
  .get('/product/:id', async (c) => {
    const productId = c.req.param('id');
    const variantId = c.req.query('variantId');

    try {
      const result = await getProductMovementHistory(db, productId, variantId);

      return success(c, result.items);
    } catch (err) {
      console.error('Error fetching product movements:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/inventory/adjust - Adjust stock manually
   */
  .post('/adjust', zValidator('json', adjustSchema), async (c) => {
    const data = c.req.valid('json');
    const user = getUser(c);

    if (!data.productId && !data.variantId) {
      return errors.badRequest(c, 'Debe especificar productId o variantId');
    }

    try {
      const movement = await adjustStock(db, {
        productId: data.productId,
        variantId: data.variantId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        createdBy: user?.id,
      });

      return success(c, movement, 201);
    } catch (err) {
      console.error('Error adjusting stock:', err);
      if (err instanceof Error) {
        if (err.message === 'Product not found' || err.message === 'Variant not found') {
          return errors.notFound(c, err.message.includes('Product') ? 'Producto' : 'Variante');
        }
      }
      return errors.serverError(c);
    }
  });
