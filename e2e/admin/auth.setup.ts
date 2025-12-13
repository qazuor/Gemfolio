import { existsSync } from 'node:fs';
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
  setup.setTimeout(120000);

  // Go to login page
  await page.goto('/login', { waitUntil: 'networkidle' });

  // Wait for login form to be visible
  await expect(page.getByRole('heading', { name: /gemfolio/i })).toBeVisible();

  const submitButton = page.getByRole('button', { name: /iniciar sesión/i });
  await submitButton.waitFor({ state: 'visible' });

  // Wait for React hydration
  await page.waitForTimeout(1000);

  // Fill login form
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');

  await emailInput.waitFor({ state: 'visible' });
  await emailInput.click();
  await emailInput.fill(ADMIN_EMAIL);

  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.click();
  await passwordInput.fill(ADMIN_PASSWORD);

  await expect(emailInput).toHaveValue(ADMIN_EMAIL);
  await expect(passwordInput).toHaveValue(ADMIN_PASSWORD);

  // Try programmatic login first (more reliable in CI)
  try {
    const loginResponse = await page.request.post('/api/auth/sign-in/email', {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (loginResponse.ok()) {
      const apiCookies = await page.context().cookies();
      const hasSessionToken = apiCookies.some((c) => c.name === 'better-auth.session_token');
      if (hasSessionToken) {
        await page.goto('/', { waitUntil: 'networkidle' });
      } else {
        await submitButton.click();
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
      }
    } else {
      await submitButton.click();
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    }
  } catch {
    await submitButton.click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  }

  await page.waitForLoadState('networkidle');

  // Check for login errors
  const errorMessage = page.locator('.bg-destructive\\/10, [role="alert"]');
  const hasError = await errorMessage.isVisible().catch(() => false);
  if (hasError) {
    const errorText = await errorMessage.textContent();
    throw new Error(`Login failed: ${errorText}`);
  }

  // Verify we're not on login page
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error('Still on login page after login attempt');
  }

  // Wait for authenticated content
  const dashboardHeading = page.getByRole('heading', { name: /dashboard/i });
  const sidebar = page.locator('aside').first();

  await Promise.race([
    dashboardHeading.waitFor({ state: 'visible', timeout: 15000 }),
    sidebar.waitFor({ state: 'visible', timeout: 15000 }),
  ]).catch(() => {
    // Continue anyway, session might still be valid
  });

  // Wait for cookies to be set
  await page.waitForTimeout(2000);

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });

  // Verify the file was created
  if (!existsSync(AUTH_FILE)) {
    throw new Error('Storage state file was not created');
  }

  // Verify we have session cookies
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find((c) => c.name.includes('session'));
  if (!sessionCookie) {
    throw new Error('No session cookie found after login');
  }
});
