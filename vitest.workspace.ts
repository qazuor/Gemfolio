import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      include: ['apps/admin/**/*.{test,spec}.{ts,tsx}'],
      name: 'admin',
      environment: 'jsdom',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      include: ['apps/web/**/*.{test,spec}.{ts,tsx}'],
      name: 'web',
      environment: 'jsdom',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      include: ['packages/**/*.{test,spec}.{ts,tsx}'],
      name: 'packages',
      environment: 'node',
    },
  },
]);
