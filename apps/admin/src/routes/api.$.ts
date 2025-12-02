import { app } from '@gemfolio/api';
import { auth } from '@gemfolio/auth/server';
import { createFileRoute } from '@tanstack/react-router';

/**
 * API route handler
 * Mounts the Hono API app under /api/*
 * Also injects the authenticated user into the Hono context
 */
async function handleApiRequest(request: Request) {
  // Get the session from Better Auth
  const session = await auth.api.getSession({ headers: request.headers });

  // Create a new request with the user info in context
  // We'll use a custom header to pass user data to Hono middleware
  const headers = new Headers(request.headers);

  if (session?.user) {
    headers.set('x-user-id', session.user.id);
    headers.set('x-user-email', session.user.email);
    headers.set('x-user-name', session.user.name || '');
    headers.set('x-user-role', (session.user as { role?: string }).role || 'customer');
  }

  const modifiedRequest = new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    // @ts-expect-error - duplex is needed for streaming
    duplex: 'half',
  });

  return app.fetch(modifiedRequest);
}

export const Route = createFileRoute('/api/$')({
  // @ts-expect-error - TanStack Start server handlers
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => handleApiRequest(request),
      POST: ({ request }: { request: Request }) => handleApiRequest(request),
      PATCH: ({ request }: { request: Request }) => handleApiRequest(request),
      PUT: ({ request }: { request: Request }) => handleApiRequest(request),
      DELETE: ({ request }: { request: Request }) => handleApiRequest(request),
    },
  },
});
