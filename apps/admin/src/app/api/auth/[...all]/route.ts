import { auth } from '@gemfolio/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';

// Better Auth handler for Next.js
export const { GET, POST } = toNextJsHandler(auth);
