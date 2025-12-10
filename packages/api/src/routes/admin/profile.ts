import { db } from '@gemfolio/db';
import { getUserById, updateUser } from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware, getUser } from '../../middleware/auth';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  image: z.string().url('URL de imagen inválida').optional().nullable(),
});

export const adminProfileRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/profile - Get current user's profile
   */
  .get('/', async (c) => {
    const currentUser = getUser(c);

    try {
      const user = await getUserById(db, currentUser.id);

      if (!user) {
        return errors.notFound(c, 'Usuario');
      }

      return success(c, user);
    } catch (err) {
      console.error('Error fetching profile:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/profile - Update current user's profile
   */
  .patch('/', zValidator('json', updateProfileSchema), async (c) => {
    const currentUser = getUser(c);
    const data = c.req.valid('json');

    try {
      const user = await getUserById(db, currentUser.id);

      if (!user) {
        return errors.notFound(c, 'Usuario');
      }

      const updatedUser = await updateUser(db, currentUser.id, {
        name: data.name,
        image: data.image,
      });

      return success(c, updatedUser);
    } catch (err) {
      console.error('Error updating profile:', err);
      return errors.serverError(c);
    }
  });
