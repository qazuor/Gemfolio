import { hc } from 'hono/client';

import type { AppType } from './index';

/**
 * Create a typed Hono client for the API
 * @param baseUrl - The base URL of the API (e.g., "http://localhost:3001")
 * @returns A typed Hono client
 */
export function createApiClient(baseUrl: string) {
  return hc<AppType>(baseUrl);
}

export type ApiClient = ReturnType<typeof createApiClient>;
