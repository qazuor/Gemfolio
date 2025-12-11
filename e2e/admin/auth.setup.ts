import { expect, test as setup } from '@playwright/test';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@gemfolio.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '123';
const AUTH_FILE = 'e2e/.auth/admin.json';

/**
 * Setup: Authenticate as admin and save session
 * Note: This requires a valid admin account to be set up in the database
 */
setup('authenticate as admin', async ({ page }) => {
  // Increase default timeout for this test
  setup.setTimeout(60000);

  // Go to login page and wait for full load
  await page.goto('/login', { waitUntil: 'networkidle' });

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

  // Submit form
  await submitButton.click();

  // Wait for loading state to appear (indicates form submission started)
  const loadingText = page.getByText(/iniciando sesión/i);
  await loadingText.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
    // Loading text might disappear too quickly
  });

  // Wait for navigation to dashboard
  await page.waitForURL('/', { timeout: 30000 });

  // Check for login errors
  const errorMessage = page.locator('.bg-destructive\\/10, [role="alert"]');
  const hasError = await errorMessage.isVisible().catch(() => false);
  if (hasError) {
    const errorText = await errorMessage.textContent();
    throw new Error(`Login failed: ${errorText}`);
  }

  // Wait for the dashboard to fully load (heading might take a moment)
  await page.waitForLoadState('networkidle');

  // Verify we're on the dashboard with case-insensitive match
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({
    timeout: 15000,
  });

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
});
