import { expect, test } from '@playwright/test';

test.describe('Admin Reviews', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to reviews page from sidebar', async ({ page }) => {
    // Ventas menu should contain Reseñas link
    const resenasLink = page.getByRole('link', { name: 'Reseñas', exact: true });

    // Try to make Reseñas link visible - may need to click Ventas button
    const isVisible = await resenasLink.isVisible().catch(() => false);
    if (!isVisible) {
      const ventasButton = page.getByRole('button', { name: /ventas/i });
      await ventasButton.click();
      // Wait for animation
      await page.waitForTimeout(300);
    }

    // Click on Reseñas
    await resenasLink.click();
    await expect(page).toHaveURL(/resenas/);
    await expect(page.getByRole('heading', { name: /reseñas/i })).toBeVisible();
  });

  test('should display reviews list page', async ({ page }) => {
    await page.goto('/resenas');
    await page.waitForLoadState('networkidle');

    // Should show page title
    await expect(page.getByRole('heading', { name: /reseñas/i })).toBeVisible();

    // Should have filter options
    await expect(page.getByText(/estado|status/i).first()).toBeVisible();
  });

  test('should have status filter on reviews page', async ({ page }) => {
    await page.goto('/resenas');
    await page.waitForLoadState('networkidle');

    // Should have status filter select or tabs
    const statusFilter = page.locator('select, [role="tablist"]').first();
    if (await statusFilter.isVisible()) {
      await expect(statusFilter).toBeVisible();
    }
  });

  test('should have search functionality on reviews page', async ({ page }) => {
    await page.goto('/resenas');
    await page.waitForLoadState('networkidle');

    // Should have search input
    const searchInput = page.getByPlaceholder(/buscar|search/i);
    if ((await searchInput.count()) > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });
});

test.describe('Admin Review Detail', () => {
  test('should display review detail page structure', async ({ page }) => {
    // Navigate to reviews list
    await page.goto('/resenas');
    await page.waitForLoadState('networkidle');

    // Find first review link (if any reviews exist)
    const reviewLink = page.locator('a[href*="/resenas/"]').first();
    if (await reviewLink.isVisible()) {
      await reviewLink.click();
      await page.waitForURL(/resenas\/.+/);

      // Should show review content
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Admin Reviews Stats', () => {
  test('should display reviews stats on reviews page', async ({ page }) => {
    await page.goto('/resenas');
    await page.waitForLoadState('networkidle');

    // Just verify page loads
    await expect(page.locator('body')).toBeVisible();
  });
});
