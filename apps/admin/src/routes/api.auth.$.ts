import { auth } from '@gemfolio/auth/server';
import { createFileRoute } from '@tanstack/react-router';

// Debug logging for CI
const logAuthConfig = (() => {
  let logged = false;
  return () => {
    if (!logged) {
      console.log('[Auth API] Environment check:');
      console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(
        `  - BETTER_AUTH_SECRET: ${process.env.BETTER_AUTH_SECRET ? `SET (${process.env.BETTER_AUTH_SECRET.length} chars)` : 'NOT SET'}`
      );
      console.log(`  - BETTER_AUTH_URL: ${process.env.BETTER_AUTH_URL || 'NOT SET'}`);
      logged = true;
    }
  };
})();

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        logAuthConfig();
        const response = await auth.handler(request);
        console.log('[Auth API] GET response status:', response.status);
        console.log(
          '[Auth API] GET response headers:',
          Object.fromEntries(response.headers.entries())
        );
        return response;
      },
      POST: async ({ request }: { request: Request }) => {
        logAuthConfig();
        const url = new URL(request.url);
        console.log('[Auth API] POST to:', url.pathname);
        const response = await auth.handler(request);
        console.log('[Auth API] POST response status:', response.status);
        console.log(
          '[Auth API] POST response headers:',
          Object.fromEntries(response.headers.entries())
        );
        return response;
      },
    },
  },
});
