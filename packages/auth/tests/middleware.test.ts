import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AuthError,
  createAuthErrorResponse,
  getSessionFromRequest,
  requireAdmin,
  requireAuth,
  requireRole,
  requireSuperAdmin,
} from '../src/middleware';

// Mock the auth module
vi.mock('../src/server', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from '../src/server';

// Type for mock session to avoid using 'any'
type MockSession = {
  user: { id: string; email: string; role?: string };
  session: { id: string };
} | null;

const mockGetSession = vi.mocked(auth.api.getSession);

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthError', () => {
    it('should create an error with default status code 401', () => {
      const error = new AuthError('Unauthorized');
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthError');
    });

    it('should create an error with custom status code', () => {
      const error = new AuthError('Forbidden', 403);
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
    });

    it('should be an instance of Error', () => {
      const error = new AuthError('Test');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('createAuthErrorResponse', () => {
    it('should create a JSON response with error details', async () => {
      const error = new AuthError('Unauthorized', 401);
      const response = createAuthErrorResponse(error);

      expect(response.status).toBe(401);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const body = await response.json();
      expect(body).toEqual({
        error: 'Unauthorized',
        code: 401,
      });
    });

    it('should handle custom status codes', async () => {
      const error = new AuthError('Forbidden: Admin access required', 403);
      const response = createAuthErrorResponse(error);

      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body).toEqual({
        error: 'Forbidden: Admin access required',
        code: 403,
      });
    });
  });

  describe('getSessionFromRequest', () => {
    it('should return session when valid', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'test@example.com', role: 'customer' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test', {
        headers: { Authorization: 'Bearer token' },
      });

      const session = await getSessionFromRequest(request);
      expect(session).toEqual(mockSession);
      expect(mockGetSession).toHaveBeenCalledWith({
        headers: request.headers,
      });
    });

    it('should return null when no session', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new Request('http://localhost/api/test');
      const session = await getSessionFromRequest(request);

      expect(session).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return session when authenticated', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'test@example.com', role: 'customer' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');
      const session = await requireAuth(request);

      expect(session).toEqual(mockSession);
    });

    it('should throw AuthError when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new Request('http://localhost/api/test');

      await expect(requireAuth(request)).rejects.toThrow(AuthError);
      await expect(requireAuth(request)).rejects.toMatchObject({
        message: 'Unauthorized',
        statusCode: 401,
      });
    });
  });

  describe('requireAdmin', () => {
    it('should return session for admin user', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');
      const session = await requireAdmin(request);

      expect(session).toEqual(mockSession);
    });

    it('should return session for super_admin user', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'superadmin@example.com', role: 'super_admin' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');
      const session = await requireAdmin(request);

      expect(session).toEqual(mockSession);
    });

    it('should throw AuthError for customer user', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'customer@example.com', role: 'customer' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');

      await expect(requireAdmin(request)).rejects.toThrow(AuthError);
      await expect(requireAdmin(request)).rejects.toMatchObject({
        message: 'Forbidden: Admin access required',
        statusCode: 403,
      });
    });

    it('should throw AuthError when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new Request('http://localhost/api/test');

      await expect(requireAdmin(request)).rejects.toThrow(AuthError);
      await expect(requireAdmin(request)).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe('requireSuperAdmin', () => {
    it('should return session for super_admin user', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'superadmin@example.com', role: 'super_admin' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');
      const session = await requireSuperAdmin(request);

      expect(session).toEqual(mockSession);
    });

    it('should throw AuthError for admin user', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');

      await expect(requireSuperAdmin(request)).rejects.toThrow(AuthError);
      await expect(requireSuperAdmin(request)).rejects.toMatchObject({
        message: 'Forbidden: Super admin access required',
        statusCode: 403,
      });
    });

    it('should throw AuthError for customer user', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'customer@example.com', role: 'customer' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');

      await expect(requireSuperAdmin(request)).rejects.toThrow(AuthError);
      await expect(requireSuperAdmin(request)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  describe('requireRole', () => {
    it('should return session when user has one of required roles', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');
      const session = await requireRole(request, ['admin', 'super_admin']);

      expect(session).toEqual(mockSession);
    });

    it('should throw AuthError when user does not have required role', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'customer@example.com', role: 'customer' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');

      await expect(requireRole(request, ['admin', 'super_admin'])).rejects.toThrow(AuthError);
      await expect(requireRole(request, ['admin', 'super_admin'])).rejects.toMatchObject({
        message: 'Forbidden: Required role: admin or super_admin',
        statusCode: 403,
      });
    });

    it('should throw AuthError when user has no role', async () => {
      const mockSession: MockSession = {
        user: { id: '1', email: 'user@example.com' },
        session: { id: 'session-1' },
      };
      mockGetSession.mockResolvedValue(mockSession as ReturnType<typeof auth.api.getSession>);

      const request = new Request('http://localhost/api/test');

      await expect(requireRole(request, ['admin'])).rejects.toThrow(AuthError);
    });
  });
});
