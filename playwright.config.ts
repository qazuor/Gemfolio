import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_STATE = path.join(__dirname, 'e2e/.auth/admin.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Setup project for admin authentication
    {
      name: 'admin-setup',
      testMatch: '**/admin/*.setup.ts',
      use: {
        baseURL: 'http://localhost:3001',
      },
    },
    {
      name: 'web-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4321',
      },
      testMatch: '**/web/**/*.spec.ts',
    },
    {
      name: 'admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
        storageState: STORAGE_STATE,
      },
      testMatch: '**/admin/**/*.spec.ts',
      dependencies: ['admin-setup'],
    },
  ],
  webServer: [
    // Admin must start first because web makes API calls to it during SSR
    // TanStack Start build doesn't generate .output/ for preview, so use dev
    {
      command: process.env.CI ? 'pnpm --filter @gemfolio/admin dev' : 'pnpm dev:admin',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        SKIP_RATE_LIMIT: 'true',
        CI: process.env.CI || '',
        NODE_ENV: 'development',
      },
    },
    {
      // Web uses Vercel adapter which doesn't support preview, so always use dev
      command: process.env.CI ? 'pnpm --filter @gemfolio/web dev' : 'pnpm dev:web',
      url: 'http://localhost:4321',
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        SKIP_RATE_LIMIT: 'true',
        CI: process.env.CI || '',
        NODE_ENV: 'development',
      },
    },
  ],
});
