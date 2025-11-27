import { expect, test } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/');
    // Expect to be redirected to login or see login form
    await expect(page.getByText(/iniciar sesión|login|sign in/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /gemfolio/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña|password/i)).toBeVisible();
  });

  test('should have OAuth buttons', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
  });
});

test.describe('Admin Visual Regression', () => {
  test('login page visual snapshot', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixels: 100,
    });
  });
});
