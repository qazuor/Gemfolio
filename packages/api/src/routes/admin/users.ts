import { db } from '@gemfolio/db';
import {
  getUserById,
  getUserOrderHistory,
  getUsers,
  getUserWithStats,
  updateUserRole,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, paginated, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware, getUser } from '../../middleware/auth';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['customer', 'admin', 'super_admin']).optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const updateRoleSchema = z.object({
  role: z.enum(['customer', 'admin', 'super_admin']),
});

export const adminUsersRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/users - List all users with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getUsers(db, {
        search: filters.search,
        role: filters.role,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      });

      return paginated(c, result.data, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/users/:id - Get user by ID with stats
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const user = await getUserWithStats(db, id);

      if (!user) {
        return errors.notFound(c, 'Usuario');
      }

      return success(c, user);
    } catch (err) {
      console.error('Error fetching user:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/users/:id/orders - Get user's order history
   */
  .get('/:id/orders', async (c) => {
    const id = c.req.param('id');
    const page = Number(c.req.query('page') ?? '1');
    const limit = Number(c.req.query('limit') ?? '10');

    try {
      const user = await getUserById(db, id);

      if (!user) {
        return errors.notFound(c, 'Usuario');
      }

      const result = await getUserOrderHistory(db, id, { page, limit });

      return paginated(c, result.data, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      console.error('Error fetching user orders:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/users/:id - Update user role
   */
  .patch('/:id', zValidator('json', updateRoleSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const currentUser = getUser(c);

    try {
      const user = await getUserById(db, id);

      if (!user) {
        return errors.notFound(c, 'Usuario');
      }

      // Prevent changing own role
      if (currentUser?.id === id) {
        return errors.badRequest(c, 'No puedes cambiar tu propio rol');
      }

      // Only super_admin can promote to admin/super_admin
      if (
        (data.role === 'admin' || data.role === 'super_admin') &&
        currentUser?.role !== 'super_admin'
      ) {
        return errors.forbidden(c);
      }

      // Prevent demoting super_admin unless you are super_admin
      if (user.role === 'super_admin' && currentUser?.role !== 'super_admin') {
        return errors.forbidden(c);
      }

      const updatedUser = await updateUserRole(db, id, data.role);

      return success(c, updatedUser);
    } catch (err) {
      console.error('Error updating user role:', err);
      return errors.serverError(c);
    }
  });
