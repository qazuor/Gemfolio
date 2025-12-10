import { expect, test } from '@playwright/test';

test.describe('Admin Dashboard - Unauthenticated', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/');
    // Expect to be redirected to login or see login form (using button which is unique)
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible({
      timeout: 10000,
    });
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

test.describe('Admin Dashboard - Authenticated', () => {
  // Use saved authentication state
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display dashboard page with correct elements', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Resumen de tu tienda')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    // Check for stats cards (using more flexible selectors)
    await expect(page.getByText('Pedidos hoy').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Ventas hoy').first()).toBeVisible();
    await expect(page.getByText('Productos activos').first()).toBeVisible();
    await expect(page.getByText('Ventas del mes').first()).toBeVisible();
  });

  test('should display recent orders section', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    // Check for recent orders section
    await expect(page.getByText('Pedidos Recientes').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display low stock alerts section', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    // Check for low stock alerts section
    await expect(page.getByText('Alertas de Stock Bajo').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to orders page from recent orders', async ({ page }) => {
    // Click on "Ver todos" link
    await page
      .getByRole('link', { name: /ver todos/i })
      .first()
      .click();
    await expect(page).toHaveURL(/pedidos/);
  });

  test('should navigate to inventory page from low stock alerts', async ({ page }) => {
    // Click on "Ver inventario" link
    await page.getByRole('link', { name: /ver inventario/i }).click();
    await expect(page).toHaveURL(/inventario/);
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // On initial load, we should see skeletons or data
    await page.waitForLoadState('networkidle');

    // Stats should be visible after loading
    const statsCards = page.locator('[class*="card"]');
    await expect(statsCards.first()).toBeVisible();
  });
});
