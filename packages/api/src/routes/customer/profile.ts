import { db } from '@gemfolio/db';
import { getUserById, updateUser } from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { authMiddleware, getUser } from '../../middleware/auth';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  image: z.string().url('URL de imagen inválida').optional().nullable(),
});

export const customerProfileRoutes = new Hono()
  // Apply only auth middleware (not admin)
  .use('*', authMiddleware)

  /**
   * GET /customer/profile - Get current user's profile
   */
  .get('/', async (c) => {
    const currentUser = getUser(c);

    try {
      const user = await getUserById(db, currentUser.id);

      if (!user) {
        return errors.notFound(c, 'Usuario');
      }

      // Return limited profile data for customers
      return success(c, {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /customer/profile - Update current user's profile
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

      if (!updatedUser) {
        return errors.serverError(c);
      }

      return success(c, {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        name: updatedUser.name,
        image: updatedUser.image,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      return errors.serverError(c);
    }
  });
