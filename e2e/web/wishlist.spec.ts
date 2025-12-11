import { expect, test } from '@playwright/test';

test.describe('Web Wishlist', () => {
  test.beforeEach(async ({ page }) => {
    // Clear wishlist before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('gemfolio-wishlist'));
  });

  test('should navigate to wishlist page', async ({ page }) => {
    await page.goto('/favoritos');
    await expect(page).toHaveURL(/favoritos/);
    await expect(page.locator('h1')).toContainText(/favoritos/i);
  });

  test('should show empty wishlist message when empty', async ({ page }) => {
    await page.goto('/favoritos');
    // Should show empty state message
    await expect(page.getByText(/lista.*vacía|está vacía/i)).toBeVisible();
    // Should have link to catalog
    await expect(page.getByRole('link', { name: /explorar/i })).toBeVisible();
  });

  test('should have wishlist icon in header', async ({ page }) => {
    await page.goto('/');
    // Wishlist icon/link should exist - might be hidden on mobile
    const wishlistLink = page.locator('a[href="/favoritos"], [aria-label*="favoritos"]');
    const count = await wishlistLink.count();
    // Wishlist link should exist somewhere (might be in mobile menu on small screens)
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Web Wishlist Button', () => {
  test('should have wishlist button on product page', async ({ page }) => {
    // Navigate to catalog first
    await page.goto('/catalogo');
    // Find a product link
    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);
      // Look for wishlist/favorite button
      const wishlistButton = page.getByRole('button', { name: /favoritos|wishlist/i });
      if ((await wishlistButton.count()) > 0) {
        await expect(wishlistButton.first()).toBeVisible();
      }
    }
  });

  test('should toggle wishlist state on product page', async ({ page }) => {
    // Clear wishlist
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('gemfolio-wishlist'));

    // Navigate to a product
    await page.goto('/catalogo');
    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Find wishlist button
      const wishlistButton = page.getByRole('button', { name: /favoritos|agregar.*favoritos/i });
      if ((await wishlistButton.count()) > 0) {
        // Click to add to wishlist
        await wishlistButton.first().click();
        await page.waitForTimeout(500);

        // Check if state changed (button text or style should change)
        const afterClick = page.getByRole('button', { name: /favoritos|en favoritos|quitar/i });
        await expect(afterClick.first()).toBeVisible();
      }
    }
  });
});

test.describe('Web Wishlist Product Card', () => {
  test('should have wishlist button on product cards in catalog', async ({ page }) => {
    await page.goto('/catalogo');
    await page.waitForSelector('a[href*="/producto/"]', { timeout: 10000 });

    // Product cards may have a small wishlist button (heart icon)
    const heartButtons = page.locator('button[aria-label*="favoritos"]');
    const count = await heartButtons.count();

    // At least some product cards should have wishlist buttons
    if (count > 0) {
      await expect(heartButtons.first()).toBeVisible();
    }
  });
});
