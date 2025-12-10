import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window for client-side tests
const originalWindow = global.window;

describe('Auth Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - Mock window
    global.window = {
      location: {
        origin: 'http://localhost:3001',
      },
    };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  describe('forgetPassword', () => {
    it('should send forget password request successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email sent' }),
      });

      // Dynamic import to get fresh module with mocked window
      const { forgetPassword } = await import('../src/client');
      const result = await forgetPassword({ email: 'test@example.com' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/forget-password',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
      expect(result.data).toEqual({ message: 'Email sent' });
      expect(result.error).toBeNull();
    });

    it('should handle forget password error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User not found' }),
      });

      const { forgetPassword } = await import('../src/client');
      const result = await forgetPassword({ email: 'notfound@example.com' });

      expect(result.error).toEqual({ message: 'User not found' });
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { forgetPassword } = await import('../src/client');
      const result = await forgetPassword({ email: 'test@example.com' });

      expect(result.error).toEqual({ message: 'Error de conexión' });
    });

    it('should handle invalid JSON response on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { forgetPassword } = await import('../src/client');
      const result = await forgetPassword({ email: 'test@example.com' });

      // Falls back to 'Error desconocido' when JSON parsing fails
      expect(result.error).toEqual({
        message: 'Error desconocido',
      });
    });
  });

  describe('resetPassword', () => {
    it('should send reset password request successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successful' }),
      });

      const { resetPassword } = await import('../src/client');
      const result = await resetPassword({
        newPassword: 'newPassword123',
        token: 'reset-token-123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            newPassword: 'newPassword123',
            token: 'reset-token-123',
          }),
        })
      );
      expect(result.data).toEqual({ message: 'Password reset successful' });
      expect(result.error).toBeNull();
    });

    it('should handle reset password error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid token' }),
      });

      const { resetPassword } = await import('../src/client');
      const result = await resetPassword({
        newPassword: 'newPassword123',
        token: 'invalid-token',
      });

      expect(result.error).toEqual({ message: 'Invalid token' });
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { resetPassword } = await import('../src/client');
      const result = await resetPassword({
        newPassword: 'newPassword123',
        token: 'token',
      });

      expect(result.error).toEqual({ message: 'Error de conexión' });
    });

    it('should handle invalid JSON response on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { resetPassword } = await import('../src/client');
      const result = await resetPassword({
        newPassword: 'newPassword123',
        token: 'token',
      });

      // Falls back to 'Error desconocido' when JSON parsing fails
      expect(result.error).toEqual({ message: 'Error desconocido' });
    });
  });
});
