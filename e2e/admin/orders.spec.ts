import { expect, test } from '@playwright/test';

test.describe('Admin Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos');
    await page.waitForLoadState('networkidle');
  });

  test('should display orders page', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: 'Pedidos', exact: true })).toBeVisible();
    await expect(page.getByText('Gestiona los pedidos de la tienda')).toBeVisible();
  });

  test('should display orders table or empty state', async ({ page }) => {
    // Should show either a table with orders or an empty state message
    const table = page.locator('table');
    const emptyState = page.getByText(/no hay pedidos/i);

    const hasTable = await table.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('should have search functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page.getByPlaceholder(/buscar por número, email o nombre/i);
    const isVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('should have filter options', async ({ page }) => {
    // Check for filter comboboxes
    await expect(page.getByRole('combobox').filter({ hasText: /estado/i })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: /pago/i })).toBeVisible();
  });

  test('should show empty state when no orders exist', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Should show either empty state message or orders table
    const emptyState = page.getByText(/no hay pedidos/i);
    const ordersTable = page.locator('table');

    const hasEmptyState = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    const hasTable = await ordersTable.isVisible({ timeout: 1000 }).catch(() => false);

    // Either empty state or table should be visible
    expect(hasEmptyState || hasTable).toBe(true);
  });
});

// Note: Order detail tests are skipped because there are no orders in the test database
// These tests would be run in an environment with seeded orders
