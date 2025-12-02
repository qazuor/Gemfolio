import type { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';

import { getQueryClient } from './lib/query-client';
import { routeTree } from './routeTree.gen';

export const getRouter = () => {
  const queryClient = getQueryClient();

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: {
      queryClient,
    },
  });

  return router;
};

declare module '@tanstack/react-router' {
  interface RouterContext {
    queryClient: QueryClient;
  }
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
