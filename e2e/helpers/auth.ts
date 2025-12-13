import type { Page } from '@playwright/test';

/**
 * Log current cookies for debugging
 */
async function logCookies(page: Page, context: string): Promise<void> {
  const cookies = await page.context().cookies();
  const sessionCookies = cookies.filter(
    (c) => c.name.includes('session') || c.name.includes('auth')
  );
  console.log(
    `[${context}] Cookies (${sessionCookies.length} auth-related of ${cookies.length} total):`
  );
  for (const cookie of sessionCookies) {
    console.log(
      `  - ${cookie.name}: domain=${cookie.domain}, value=${cookie.value.substring(0, 20)}...`
    );
  }
}

/**
 * Wait for the page to be authenticated.
 * This checks that we're not on the login page and that some authenticated content is visible.
 * If not authenticated, it will wait for a redirect or timeout.
 */
export async function waitForAuthenticated(
  page: Page,
  options?: { timeout?: number }
): Promise<boolean> {
  const timeout = options?.timeout ?? 10000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentUrl = page.url();

    // If we're on the login page, wait a bit and try again
    if (currentUrl.includes('/login')) {
      await page.waitForTimeout(500);
      continue;
    }

    // Check for authenticated content (sidebar or dashboard heading)
    const sidebar = page.locator('aside').first();
    const dashboardHeading = page.getByRole('heading', { name: /dashboard/i });

    const hasSidebar = await sidebar.isVisible().catch(() => false);
    const hasDashboard = await dashboardHeading.isVisible().catch(() => false);

    if (hasSidebar || hasDashboard) {
      return true;
    }

    // Wait a bit before checking again
    await page.waitForTimeout(500);
  }

  // Final check
  const finalUrl = page.url();
  return !finalUrl.includes('/login');
}

/**
 * Ensure the page is authenticated before proceeding.
 * If not authenticated, throws an error with helpful message.
 */
export async function ensureAuthenticated(page: Page, testName?: string): Promise<void> {
  const isAuthenticated = await waitForAuthenticated(page, { timeout: 15000 });

  if (!isAuthenticated) {
    const currentUrl = page.url();
    throw new Error(
      `[${testName || 'Test'}] Not authenticated - redirected to ${currentUrl}. ` +
        'This might indicate a session persistence issue. ' +
        'Make sure the admin-setup ran successfully and saved valid session cookies.'
    );
  }
}

/**
 * Navigate to a page and ensure we're authenticated.
 * This is a safer version of page.goto for authenticated pages.
 */
export async function gotoAuthenticated(
  page: Page,
  path: string,
  options?: { waitForLoadState?: boolean }
): Promise<void> {
  // Log cookies before navigation to verify storageState is loaded
  await logCookies(page, `gotoAuthenticated(${path}) - before navigation`);

  await page.goto(path);

  if (options?.waitForLoadState !== false) {
    await page.waitForLoadState('networkidle').catch(() => {
      // networkidle might timeout on slow pages, continue anyway
    });
  }

  // Wait a moment for any redirects
  await page.waitForTimeout(500);

  // Check if we got redirected to login
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    // Log cookies to debug why we were redirected
    await logCookies(page, `gotoAuthenticated(${path}) - redirected to login`);

    // Try to wait for any pending redirects
    await page.waitForTimeout(2000);

    const finalUrl = page.url();
    if (finalUrl.includes('/login')) {
      throw new Error(
        `Navigation to ${path} failed - redirected to login. ` +
          'Session might not be properly authenticated.'
      );
    }
  }
}
