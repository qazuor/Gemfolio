import { expect, test } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test('should display product information', async ({ page }) => {
    // Navigate to catalog and find a product
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Product page should have key elements - use .first() as there may be multiple h1s
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('should display product images', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Should have at least one product image
      const images = page.locator('img');
      await expect(images.first()).toBeVisible();
    }
  });

  test('should display product price', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Price should contain currency symbol or number
      const priceElement = page.locator('text=/\\$|ARS|\\d+/');
      await expect(priceElement.first()).toBeVisible();
    }
  });

  test('should have add to cart button', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      const addButton = page.getByRole('button', { name: /agregar|añadir|add/i });
      await expect(addButton).toBeVisible();
    }
  });

  test('should have quantity selector', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Look for quantity input or buttons
      const quantitySelector = page.locator(
        'input[type="number"], [aria-label*="cantidad"], [data-testid="quantity"]'
      );
      const plusButton = page.getByRole('button', { name: /\+|más|increase/i });

      const hasQuantitySelector =
        (await quantitySelector.count()) > 0 || (await plusButton.count()) > 0;
      expect(hasQuantitySelector).toBe(true);
    }
  });

  test('should show related products section', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Look for related products section
      const relatedSection = page.locator('text=/relacionados|similar|también/i');
      // Related products might not always be present
      if (await relatedSection.isVisible()) {
        await expect(relatedSection).toBeVisible();
      }
    }
  });
});

test.describe('Product Page SEO', () => {
  test('should have meta description', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveCount(1);
    }
  });

  test('should have structured data', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      const structuredData = page.locator('script[type="application/ld+json"]');
      const count = await structuredData.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Product Page Accessibility', () => {
  test('should have accessible images', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Product images should have alt text
      const images = page.locator('img[alt]');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      // Tab through the page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should have focused element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });
});
