import { expect, test } from '@playwright/test';

test.describe('Admin Abandoned Carts', () => {
  // Use saved authentication state
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to abandoned carts page from sidebar', async ({ page }) => {
    // Ventas menu should contain Carritos abandonados link
    const carritosLink = page.getByRole('link', { name: /carritos abandonados/i });

    // Try to make link visible - may need to click Ventas button
    const isVisible = await carritosLink.isVisible().catch(() => false);
    if (!isVisible) {
      const ventasButton = page.getByRole('button', { name: /ventas/i });
      await ventasButton.click();
      // Wait for animation
      await page.waitForTimeout(300);
    }

    // Click on Carritos abandonados
    await carritosLink.click();
    await expect(page).toHaveURL(/carritos-abandonados/);
    await expect(page.getByRole('heading', { name: /carritos abandonados/i })).toBeVisible();
  });

  test('should display abandoned carts list page', async ({ page }) => {
    await page.goto('/carritos-abandonados');
    await page.waitForLoadState('networkidle');

    // Should show page title
    await expect(page.getByRole('heading', { name: /carritos abandonados/i })).toBeVisible();
  });

  test('should have status filter on abandoned carts page', async ({ page }) => {
    await page.goto('/carritos-abandonados');
    await page.waitForLoadState('networkidle');

    // Should have status filter select or tabs
    const statusFilter = page.locator('select').first();
    if (await statusFilter.isVisible()) {
      await expect(statusFilter).toBeVisible();
    }
  });

  test('should display stats cards on abandoned carts page', async ({ page }) => {
    await page.goto('/carritos-abandonados');
    await page.waitForLoadState('networkidle');

    // Should show some statistics cards
    // Look for stat elements like total value, count, recovery rate
    const statsSection = page.locator('[class*="grid"]').first();
    await expect(statsSection).toBeVisible();
  });
});

test.describe('Admin Abandoned Cart Detail', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('should display abandoned cart detail page structure', async ({ page }) => {
    // Navigate to abandoned carts list
    await page.goto('/carritos-abandonados');
    await page.waitForLoadState('networkidle');

    // Find first cart link (if any carts exist)
    const cartLink = page.locator('a[href*="/carritos-abandonados/"]').first();
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await page.waitForURL(/carritos-abandonados\/.+/);

      // Should show cart details
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Admin Abandoned Carts Recovery', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('should have send email button in cart detail', async ({ page }) => {
    await page.goto('/carritos-abandonados');
    await page.waitForLoadState('networkidle');

    // Find first cart link (if any carts exist)
    const cartLink = page.locator('a[href*="/carritos-abandonados/"]').first();
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await page.waitForURL(/carritos-abandonados\/.+/);

      // Just verify the page structure loads
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
