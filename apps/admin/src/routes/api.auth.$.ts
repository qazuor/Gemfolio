import { auth } from '@gemfolio/auth/server';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => {
        return auth.handler(request);
      },
      POST: ({ request }: { request: Request }) => {
        return auth.handler(request);
      },
    },
  },
});
