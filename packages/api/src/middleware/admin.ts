import type { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';

import { errors } from '../lib/response';
import type { AuthUser } from './auth';

type AdminEnv = {
  Variables: {
    user: AuthUser;
  };
};

/**
 * Admin middleware
 * Verifies that the authenticated user has admin or super_admin role
 * Must be used after authMiddleware
 */
export const adminMiddleware = createMiddleware<AdminEnv>(async (c: Context, next: Next) => {
  const user = c.get('user') as AuthUser | undefined;

  if (!user) {
    return errors.unauthorized(c, 'Sesión no válida o expirada');
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return errors.forbidden(c, 'Se requieren permisos de administrador');
  }

  await next();
});

/**
 * Super admin middleware
 * Verifies that the authenticated user has super_admin role
 * Must be used after authMiddleware
 */
export const superAdminMiddleware = createMiddleware<AdminEnv>(async (c: Context, next: Next) => {
  const user = c.get('user') as AuthUser | undefined;

  if (!user) {
    return errors.unauthorized(c, 'Sesión no válida o expirada');
  }

  if (user.role !== 'super_admin') {
    return errors.forbidden(c, 'Se requieren permisos de super administrador');
  }

  await next();
});
