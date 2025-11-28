import { defineConfig, devices } from '@playwright/test';

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
    {
      name: 'web-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4321',
      },
      testMatch: '**/web/**/*.spec.ts',
    },
    {
      name: 'web-mobile',
      use: {
        ...devices['iPhone 14'],
        baseURL: 'http://localhost:4321',
      },
      testMatch: '**/web/**/*.spec.ts',
    },
    {
      name: 'admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
      testMatch: '**/admin/**/*.spec.ts',
    },
  ],
  webServer: [
    {
      command: 'pnpm dev:web',
      url: 'http://localhost:4321',
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
    },
    {
      command: 'pnpm dev:admin',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
    },
  ],
});
