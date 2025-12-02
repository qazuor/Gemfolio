import { GET, POST } from '@gemfolio/storage/server';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Uploadthing API route handler
 * Handles file uploads via Uploadthing
 */
export const Route = createFileRoute('/api/uploadthing/$')({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
      POST: ({ request }) => POST(request),
    },
  },
});
