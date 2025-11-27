import { auth } from './server';

type UserRole = 'customer' | 'admin' | 'super_admin';

// Session type from Better Auth
export type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Get the current session from request headers
 */
export async function getSessionFromRequest(request: Request): Promise<SessionData | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session;
}

/**
 * Verify if the user has a valid session
 */
export async function requireAuth(request: Request): Promise<NonNullable<SessionData>> {
  const session = await getSessionFromRequest(request);

  if (!session) {
    throw new AuthError('Unauthorized', 401);
  }

  return session;
}

/**
 * Verify if the user has admin role
 */
export async function requireAdmin(request: Request): Promise<NonNullable<SessionData>> {
  const session = await requireAuth(request);

  const userRole = (session.user as { role?: UserRole }).role;

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    throw new AuthError('Forbidden: Admin access required', 403);
  }

  return session;
}

/**
 * Verify if the user has super admin role
 */
export async function requireSuperAdmin(request: Request): Promise<NonNullable<SessionData>> {
  const session = await requireAuth(request);

  const userRole = (session.user as { role?: UserRole }).role;

  if (userRole !== 'super_admin') {
    throw new AuthError('Forbidden: Super admin access required', 403);
  }

  return session;
}

/**
 * Check if user has specific role(s)
 */
export async function requireRole(
  request: Request,
  roles: UserRole[]
): Promise<NonNullable<SessionData>> {
  const session = await requireAuth(request);

  const userRole = (session.user as { role?: UserRole }).role;

  if (!userRole || !roles.includes(userRole)) {
    throw new AuthError(`Forbidden: Required role: ${roles.join(' or ')}`, 403);
  }

  return session;
}

/**
 * Custom auth error class
 */
export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Helper to create JSON error response
 */
export function createAuthErrorResponse(error: AuthError): Response {
  return new Response(
    JSON.stringify({
      error: error.message,
      code: error.statusCode,
    }),
    {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
