import type { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';

import { errors } from '../lib/response';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'customer' | 'admin' | 'super_admin';
};

type AuthEnv = {
  Variables: {
    user: AuthUser;
  };
};

/**
 * Authentication middleware
 * Verifies that the request has a valid session
 * Reads user data from custom headers set by the app's auth integration
 */
export const authMiddleware = createMiddleware<AuthEnv>(async (c: Context, next: Next) => {
  // First check if user is already in context
  let user = c.get('user') as AuthUser | undefined;

  // If not, try to get from headers (set by TanStack Start integration)
  if (!user) {
    const userId = c.req.header('x-user-id');
    const userEmail = c.req.header('x-user-email');
    const userName = c.req.header('x-user-name');
    const userRole = c.req.header('x-user-role') as AuthUser['role'] | undefined;

    if (userId && userEmail) {
      user = {
        id: userId,
        email: userEmail,
        name: userName || null,
        role: userRole || 'customer',
      };
      c.set('user', user);
    }
  }

  if (!user) {
    return errors.unauthorized(c, 'Sesión no válida o expirada');
  }

  // User is authenticated, proceed
  await next();
});

/**
 * Helper to get the authenticated user from context
 */
export function getUser(c: Context): AuthUser {
  return c.get('user') as AuthUser;
}
