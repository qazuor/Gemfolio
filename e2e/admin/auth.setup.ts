import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test as setup } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@gemfolio.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '123';
const AUTH_FILE = path.join(__dirname, '../.auth/admin.json');

/**
 * Setup: Authenticate as admin and save session
 * Note: This requires a valid admin account to be set up in the database
 */
setup('authenticate as admin', async ({ page }) => {
  // Increase default timeout for this test
  setup.setTimeout(120000);

  console.log('[Auth Setup] Starting admin authentication...');

  // Go to login page and wait for full load
  await page.goto('/login', { waitUntil: 'networkidle' });
  console.log('[Auth Setup] Login page loaded');

  // Wait for login form to be visible
  await expect(page.getByRole('heading', { name: /gemfolio/i })).toBeVisible();

  // Wait for React hydration - ensure the button is not disabled initially
  const submitButton = page.getByRole('button', { name: /iniciar sesión/i });
  await submitButton.waitFor({ state: 'visible' });

  // Small delay to ensure React has hydrated
  await page.waitForTimeout(1000);

  // Fill login form using id selectors for more reliability
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');

  await emailInput.waitFor({ state: 'visible' });
  await emailInput.click();
  await emailInput.fill(ADMIN_EMAIL);

  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.click();
  await passwordInput.fill(ADMIN_PASSWORD);

  // Verify the values were filled
  await expect(emailInput).toHaveValue(ADMIN_EMAIL);
  await expect(passwordInput).toHaveValue(ADMIN_PASSWORD);

  console.log('[Auth Setup] Form filled, submitting...');

  // Submit form
  await submitButton.click();

  // Wait for loading state to appear (indicates form submission started)
  const loadingText = page.getByText(/iniciando sesión/i);
  await loadingText.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
    // Loading text might disappear too quickly
  });

  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  console.log('[Auth Setup] Navigated away from login page');

  // Check for login errors on current page
  const errorMessage = page.locator('.bg-destructive\\/10, [role="alert"]');
  const hasError = await errorMessage.isVisible().catch(() => false);
  if (hasError) {
    const errorText = await errorMessage.textContent();
    throw new Error(`Login failed: ${errorText}`);
  }

  // Wait for page to fully load
  await page.waitForLoadState('networkidle');

  // Verify we're authenticated by checking we're not on login page
  let currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error('Still on login page after login attempt');
  }

  // Wait for dashboard content to be visible (important for session to be established)
  // This ensures the session is fully established before saving
  const dashboardHeading = page.getByRole('heading', { name: /dashboard/i });
  const sidebar = page.locator('aside').first();

  // Wait for either dashboard heading or sidebar to be visible
  await Promise.race([
    dashboardHeading.waitFor({ state: 'visible', timeout: 15000 }),
    sidebar.waitFor({ state: 'visible', timeout: 15000 }),
  ]).catch(() => {
    console.warn(
      '[Auth Setup] Dashboard heading/sidebar not found, checking for other authenticated content...'
    );
  });

  // Additional wait to ensure session cookies are properly set
  await page.waitForTimeout(2000);

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
  console.log('[Auth Setup] Storage state saved to:', AUTH_FILE);

  // CRITICAL: Verify the session persists by reloading the page
  // This catches issues where the session is not properly persisted
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    // Session did not persist - this is a critical error
    throw new Error(
      '[Auth Setup] Session did not persist after reload. This indicates a session persistence issue.'
    );
  }

  // Verify we can see authenticated content after reload
  const hasDashboardAfterReload = await dashboardHeading
    .isVisible({ timeout: 10000 })
    .catch(() => false);
  const hasSidebarAfterReload = await sidebar.isVisible({ timeout: 5000 }).catch(() => false);

  if (!hasDashboardAfterReload && !hasSidebarAfterReload) {
    console.warn(
      '[Auth Setup] Warning: Dashboard/sidebar not visible after reload, but not on login page'
    );
  } else {
    console.log('[Auth Setup] Session verified - authenticated content visible after reload');
  }

  console.log('[Auth Setup] Authentication setup completed successfully');
});
