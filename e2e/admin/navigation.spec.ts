import { expect, test } from '@playwright/test';

test.describe('Admin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display sidebar navigation on desktop', async ({ page }) => {
    // Desktop sidebar should be visible (hidden on lg: breakpoint)
    // Check for main navigation items
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
    // Catálogo and Ventas are buttons (expandable menus)
    await expect(page.getByRole('button', { name: /catálogo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ventas/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inventario', exact: true })).toBeVisible();
  });

  test('should navigate to dashboard from sidebar', async ({ page }) => {
    // Navigate to another page first
    await page.goto('/inventario');
    await expect(page).toHaveURL(/inventario/);

    // Click dashboard link
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3001\/?$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should navigate to inventario page', async ({ page }) => {
    await page.getByRole('link', { name: 'Inventario', exact: true }).click();
    await expect(page).toHaveURL(/inventario/);
    await expect(page.getByRole('heading', { name: /inventario/i })).toBeVisible();
  });

  test('should have Catálogo submenu items visible and navigate to productos', async ({ page }) => {
    // Catálogo menu - expand it to see submenu items
    const catalogoButton = page.getByRole('button', { name: /catálogo/i });
    const productosLink = page.getByRole('link', { name: 'Productos', exact: true });

    // Ensure submenu is expanded - try clicking and waiting
    for (let attempt = 0; attempt < 3; attempt++) {
      const isVisible = await productosLink.isVisible().catch(() => false);
      if (isVisible) break;

      await catalogoButton.click();
      await page.waitForTimeout(500);
    }

    // Should see submenu items now
    await expect(productosLink).toBeVisible({ timeout: 5000 });

    // Click on Productos
    await productosLink.click();
    await expect(page).toHaveURL(/productos/);
    await expect(page.getByRole('heading', { name: 'Productos', exact: true })).toBeVisible();
  });

  test('should have Ventas submenu items visible and navigate to pedidos', async ({ page }) => {
    // Ventas menu - expand it to see submenu items
    const ventasButton = page.getByRole('button', { name: /ventas/i });
    const pedidosLink = page.getByRole('link', { name: 'Pedidos', exact: true });

    // Ensure submenu is expanded - try clicking and waiting
    for (let attempt = 0; attempt < 3; attempt++) {
      const isVisible = await pedidosLink.isVisible().catch(() => false);
      if (isVisible) break;

      await ventasButton.click();
      await page.waitForTimeout(500);
    }

    // Should see submenu items now
    await expect(pedidosLink).toBeVisible({ timeout: 5000 });

    // Click on Pedidos
    await pedidosLink.click();
    await expect(page).toHaveURL(/pedidos/);
    await expect(page.getByRole('heading', { name: /pedidos/i }).first()).toBeVisible();
  });

  test('should display user menu in header', async ({ page }) => {
    // Check for user avatar button in header (shows initials "A")
    const userButton = page.locator('header button').filter({ hasText: /^[A-Z]$/ });
    const hasUserButton = await userButton
      .first()
      .isVisible()
      .catch(() => false);

    // Or check for any button that might be the user menu
    const anyHeaderButton = page.locator('header button').last();
    const hasAnyButton = await anyHeaderButton.isVisible().catch(() => false);

    expect(hasUserButton || hasAnyButton).toBeTruthy();
  });

  test('should have logout option in user menu', async ({ page }) => {
    // Click on user menu button (last button in header, shows initials)
    const userMenuButton = page.locator('header button').last();
    await userMenuButton.click();

    // Check for logout option in dropdown
    await expect(
      page
        .getByRole('menuitem', { name: /cerrar sesión|logout/i })
        .or(page.getByText(/cerrar sesión|logout/i))
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Mobile Navigation', () => {
  test('should display mobile menu button', async ({ page, isMobile }) => {
    // Only run on mobile viewport
    test.skip(isMobile !== true, 'Mobile navigation test - skip on desktop');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for "Abrir menú" button
    const menuButton = page.getByRole('button', { name: /abrir menú|menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should open mobile sidebar on menu click', async ({ page, isMobile }) => {
    // Only run on mobile viewport
    test.skip(isMobile !== true, 'Mobile navigation test - skip on desktop');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click menu button
    const menuButton = page.getByRole('button', { name: /abrir menú|menu/i });
    await menuButton.click();

    // Check for navigation links in mobile sidebar dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
  });

  test('should close mobile sidebar when pressing escape', async ({ page, isMobile }) => {
    // Only run on mobile viewport
    test.skip(isMobile !== true, 'Mobile navigation test - skip on desktop');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open mobile menu
    await page.getByRole('button', { name: /abrir menú|menu/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Press escape to close
    await page.keyboard.press('Escape');

    // Dialog should be closed
    await expect(dialog).not.toBeVisible();
  });
});
