import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client for React applications
 * Provides hooks and methods for authentication
 */
export const authClient = createAuthClient({
  // Base URL will be configured by the consuming app
  // Default to relative path for same-origin requests
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
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

// Export the client for advanced usage
export { authClient as client };

// Type exports
export type Session = typeof authClient.$Infer.Session;
export type User = Session['user'];
