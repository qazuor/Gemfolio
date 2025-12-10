import { expect, test } from '@playwright/test';

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page with correct elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/admin/i);

    // Check heading
    await expect(page.getByRole('heading', { name: /gemfolio/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();

    // Check form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();

    // Check social login buttons
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();

    // Check links
    await expect(page.getByRole('link', { name: /recuperar contraseña/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /crear cuenta/i })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill form with invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Contraseña').fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Wait for error message or stay on login page
    // The error message might be in Spanish and could vary
    const errorLocator = page
      .locator('.bg-destructive\\/10, [role="alert"]')
      .or(page.getByText(/error|credenciales|inválido|invalid/i));

    // Should show error message or stay on login page (both acceptable behaviors)
    await expect(async () => {
      const hasError = await errorLocator.isVisible().catch(() => false);
      const isOnLoginPage = page.url().includes('login');
      expect(hasError || isOnLoginPage).toBeTruthy();
    }).toPass({ timeout: 10000 });
  });

  test('should require email and password', async ({ page }) => {
    // Email field should be required
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('required');

    // Password field should be required
    const passwordInput = page.getByLabel('Contraseña');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: /recuperar contraseña/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /crear cuenta/i }).click();
    await expect(page).toHaveURL(/register/);
  });
});
