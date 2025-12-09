import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client for React applications
 * Provides hooks and methods for authentication
 */
export const authClient = createAuthClient({
  // Base URL will be configured by the consuming app
  // Default to relative path for same-origin requests
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  // Ensure cookies are sent with requests for session persistence
  fetchOptions: {
    credentials: 'include',
  },
});

// Re-export all client methods and hooks
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Social OAuth sign-in helpers
export const signInWithGoogle = () =>
  authClient.signIn.social({
    provider: 'google',
    callbackURL: '/',
  });

export const signInWithGitHub = () =>
  authClient.signIn.social({
    provider: 'github',
    callbackURL: '/',
  });

// Password reset helpers
// Note: forgetPassword makes a direct API call since it's not always typed in the client
export const forgetPassword = async (data: { email: string; redirectTo?: string }) => {
  const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
  try {
    const response = await fetch(`${baseURL}/api/auth/forget-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      return {
        error: { message: error.message || 'Error al solicitar recuperación de contraseña' },
      };
    }

    return { data: await response.json(), error: null };
  } catch (_err) {
    return { error: { message: 'Error de conexión' } };
  }
};

export const resetPassword = async (data: { newPassword: string; token: string }) => {
  const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
  try {
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      return { error: { message: error.message || 'Error al restablecer contraseña' } };
    }

    return { data: await response.json(), error: null };
  } catch (_err) {
    return { error: { message: 'Error de conexión' } };
  }
};

// Export the client for advanced usage
export { authClient as client };

// Type exports
export type Session = typeof authClient.$Infer.Session;
export type User = Session['user'];
