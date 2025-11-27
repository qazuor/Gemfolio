// Server exports

// Client exports
export {
  authClient,
  client,
  getSession,
  type Session,
  signIn,
  signOut,
  signUp,
  type User,
  useSession,
} from './client';
// Middleware exports
export {
  AuthError,
  createAuthErrorResponse,
  getSessionFromRequest,
  requireAdmin,
  requireAuth,
  requireRole,
  requireSuperAdmin,
  type SessionData,
} from './middleware';
export { type Auth, auth } from './server';
