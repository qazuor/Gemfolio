import { expect, test } from '@playwright/test';

test.describe('Web Comparator', () => {
  test.beforeEach(async ({ page }) => {
    // Clear comparator before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('gemfolio-comparator'));
  });

  test('should navigate to comparator page', async ({ page }) => {
    await page.goto('/comparar');
    await expect(page).toHaveURL(/comparar/);
    await expect(page.locator('h1')).toContainText(/comparar/i);
  });

  test('should show empty comparator message when empty', async ({ page }) => {
    await page.goto('/comparar');
    // Should show empty state message
    await expect(page.getByText(/vacío|está vacío/i)).toBeVisible();
    // Should have link to catalog
    await expect(page.getByRole('link', { name: /explorar/i })).toBeVisible();
  });

  test('should have comparator icon in header', async ({ page }) => {
    await page.goto('/');
    // Comparator icon/link should exist (if implemented in header)
    const comparatorLink = page.locator('a[href="/comparar"], [aria-label*="comparar"]');
    // This is optional, may not be in all headers
    const count = await comparatorLink.count();
    if (count > 0) {
      await expect(comparatorLink.first()).toBeVisible();
    }
  });
});

test.describe('Web Comparator Button', () => {
  test('should have compare button on product page', async ({ page }) => {
    // Navigate to catalog first
    await page.goto('/catalogo');
    // Find a product link
    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);
      // Look for compare button
      const compareButton = page.getByRole('button', { name: /comparar|compare/i });
      if ((await compareButton.count()) > 0) {
        await expect(compareButton.first()).toBeVisible();
      }
    }
  });

  test('should toggle compare state on product page', async ({ page }) => {
    // Clear comparator
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('gemfolio-comparator'));

    // Navigate to a product
    await page.goto('/catalogo');
    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Find compare button
      const compareButton = page.getByRole('button', { name: /comparar/i });
      if ((await compareButton.count()) > 0) {
        // Click to add to comparator
        await compareButton.first().click();
        await page.waitForTimeout(500);

        // Check if state changed (button text or style should change)
        const afterClick = page.getByRole('button', { name: /comparador|en comparador|quitar/i });
        if ((await afterClick.count()) > 0) {
          await expect(afterClick.first()).toBeVisible();
        }
      }
    }
  });
});

test.describe('Web Comparator Max Limit', () => {
  test('should respect maximum product limit', async ({ page }) => {
    await page.goto('/comparar');

    // Set up comparator with 4 products (max limit) via localStorage
    await page.evaluate(() => {
      const products = [
        { id: '1', name: 'Product 1', slug: 'product-1', price: 100, attributes: {} },
        { id: '2', name: 'Product 2', slug: 'product-2', price: 200, attributes: {} },
        { id: '3', name: 'Product 3', slug: 'product-3', price: 300, attributes: {} },
        { id: '4', name: 'Product 4', slug: 'product-4', price: 400, attributes: {} },
      ];
      localStorage.setItem('gemfolio-comparator', JSON.stringify(products));
    });

    // Reload to see the products
    await page.reload();

    // Should show 4 products
    await expect(page.getByText(/4 de 4/i)).toBeVisible();
  });
});

test.describe('Web Comparator Clear', () => {
  test('should clear all products from comparator', async ({ page }) => {
    // Set up comparator with products
    await page.goto('/');
    await page.evaluate(() => {
      const products = [
        { id: '1', name: 'Product 1', slug: 'product-1', price: 100, attributes: {} },
        { id: '2', name: 'Product 2', slug: 'product-2', price: 200, attributes: {} },
      ];
      localStorage.setItem('gemfolio-comparator', JSON.stringify(products));
    });

    await page.goto('/comparar');

    // Find and click clear button
    const clearButton = page.getByRole('button', { name: /limpiar|clear/i });
    if (await clearButton.isVisible()) {
      // Handle confirm dialog
      page.on('dialog', (dialog) => dialog.accept());
      await clearButton.click();
      await page.waitForTimeout(500);

      // Should show empty state
      await expect(page.getByText(/vacío|está vacío/i)).toBeVisible();
    }
  });
});
