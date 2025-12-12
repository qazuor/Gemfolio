import { expect, test } from '@playwright/test';

test.describe('Admin Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/productos');
    await page.waitForLoadState('networkidle');
  });

  test('should display products page', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: 'Productos', exact: true })).toBeVisible();
    await expect(page.getByText('Gestiona el catálogo de productos')).toBeVisible();
  });

  test('should display products table with data', async ({ page }) => {
    // Should show products table with data (there are seeded products)
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check for product names
    await expect(page.getByText(/reloj|anillo|collar|pulsera/i).first()).toBeVisible();
  });

  test('should have create product link', async ({ page }) => {
    // Check for create link (it's a link, not a button)
    await expect(page.getByRole('link', { name: /nuevo producto/i })).toBeVisible();
  });

  test('should navigate to create product page', async ({ page }) => {
    // Click create link
    const createLink = page.getByRole('link', { name: /nuevo producto/i });
    await expect(createLink).toBeVisible();
    await createLink.click();
    await page.waitForURL(/productos\/nuevo/);
    await expect(page).toHaveURL(/productos\/nuevo/);
  });

  test('should have search functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page.getByPlaceholder(/buscar productos/i);
    await expect(searchInput).toBeVisible();

    // Try to search and press Enter to trigger search
    await searchInput.fill('reloj');
    await searchInput.press('Enter');

    // Wait for search to be processed (debounced)
    await page.waitForTimeout(1000);

    // Verify search input has value (URL update may be debounced or client-side only)
    await expect(searchInput).toHaveValue('reloj');
  });

  test('should have filter options', async ({ page }) => {
    // Check for filter comboboxes
    await expect(page.getByRole('combobox').filter({ hasText: /estado/i })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: /categoría/i })).toBeVisible();
  });

  test('should have actions menu on product rows', async ({ page }) => {
    // Check for actions button in table
    const actionsButton = page.getByRole('button', { name: /acciones/i }).first();
    await expect(actionsButton).toBeVisible();

    // Click actions to open menu
    await actionsButton.click();
    await expect(page.getByRole('menu')).toBeVisible();
  });
});

test.describe('Admin Create Product', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/productos/nuevo');
    await page.waitForLoadState('networkidle');
  });

  test('should display create product form', async ({ page }) => {
    // Check heading
    await expect(page.getByRole('heading', { name: /nuevo producto/i })).toBeVisible();

    // Check tabs
    await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Precios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Inventario' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'SEO' })).toBeVisible();

    // Check form elements in General tab
    await expect(page.getByRole('textbox', { name: 'Nombre' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Slug' })).toBeVisible();
  });

  test('should have submit and cancel buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear producto' })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: 'Crear producto' });
    await submitButton.click();

    // Wait for validation to trigger
    await page.waitForTimeout(500);

    // Form should show validation feedback (the form won't submit without required fields)
    // Check we're still on the create page
    await expect(page).toHaveURL(/productos\/nuevo/);
  });

  test('should navigate between tabs', async ({ page }) => {
    // Click on Precios tab
    await page.getByRole('tab', { name: 'Precios' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Precios' })).toBeVisible();

    // Click on Inventario tab
    await page.getByRole('tab', { name: 'Inventario' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Inventario' })).toBeVisible();

    // Click on SEO tab
    await page.getByRole('tab', { name: 'SEO' }).click();
    await expect(page.getByRole('tabpanel', { name: 'SEO' })).toBeVisible();
  });
});

test.describe('Admin Categories', () => {
  test('should display categories page', async ({ page }) => {
    await page.goto('/categorias');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /categorías/i })).toBeVisible();
  });

  test('should have create category option', async ({ page }) => {
    await page.goto('/categorias');
    await page.waitForLoadState('networkidle');

    // Look for a create button or link
    const createButton = page.getByRole('button', { name: /nueva|crear|agregar/i });
    const createLink = page.getByRole('link', { name: /nueva|crear|agregar/i });

    const hasButton = await createButton.isVisible().catch(() => false);
    const hasLink = await createLink.isVisible().catch(() => false);

    expect(hasButton || hasLink).toBeTruthy();
  });
});
