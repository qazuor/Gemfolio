import { auth } from '@gemfolio/auth/server';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

/**
 * Server function to get the current session
 * This runs on the server and has access to cookies via headers
 */
export const getSessionServer = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();

  const session = await auth.api.getSession({
    headers: headers,
  });

  return session;
});
