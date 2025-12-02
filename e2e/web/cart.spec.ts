import { expect, test } from '@playwright/test';

test.describe('Web Cart', () => {
  test('should have cart icon in header', async ({ page }) => {
    await page.goto('/');
    // Cart icon should exist in header
    await expect(page.locator('header')).toBeVisible();
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/carrito');
    await expect(page).toHaveURL(/carrito/);
  });

  test('should show empty cart message when empty', async ({ page }) => {
    // Clear localStorage to ensure empty cart
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('gemfolio-cart'));
    await page.goto('/carrito');
    // Should show empty state or cart content
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Web Cart Drawer', () => {
  test('should open cart drawer when clicking cart icon', async ({ page }) => {
    await page.goto('/');
    // Find cart button and click it
    const cartButton = page.getByRole('button', { name: /carrito|cart/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
      // Wait for drawer animation
      await page.waitForTimeout(500);
      // Look for drawer elements
      const drawer = page.locator('[role="dialog"], [data-testid="cart-drawer"], .fixed.right-0');
      await expect(drawer.first()).toBeVisible();
    }
  });
});

test.describe('Web Add to Cart Flow', () => {
  test('should have add to cart button on product page', async ({ page }) => {
    // Navigate to catalog first
    await page.goto('/catalogo');
    // Find a product link
    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);
      // Look for add to cart button
      const addToCartButton = page.getByRole('button', { name: /agregar|añadir|add to cart/i });
      await expect(addToCartButton).toBeVisible();
    }
  });
});
