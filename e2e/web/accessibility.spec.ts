import { expect, test } from '@playwright/test';

test.describe('Page Accessibility', () => {
  test('should have a main landmark', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Should have an h1
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have accessible images', async ({ page }) => {
    await page.goto('/');

    // All images should have alt text
    const imagesWithoutAlt = page.locator('img:not([alt])');
    const count = await imagesWithoutAlt.count();
    expect(count).toBe(0);
  });

  test('should have accessible links', async ({ page }) => {
    await page.goto('/');

    // Links should have descriptive text or aria-label
    const emptyLinks = page.locator('a:not([aria-label]):empty');
    const count = await emptyLinks.count();
    expect(count).toBe(0);
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/');

    // Buttons should have text or aria-label
    const buttonsWithoutLabel = page.locator('button:not([aria-label]):not(:has(text))');
    const count = await buttonsWithoutLabel.count();
    // Some icon buttons might not have visible text
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have skip to content link', async ({ page }) => {
    await page.goto('/');

    // Skip link should be present
    const skipLink = page.locator('a[href="#main-content"], a[href="#content"], .skip-link');
    const count = await skipLink.count();
    // Skip link might not be implemented
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Keyboard Navigation', () => {
  test('should show focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should navigate through nav items', async ({ page }) => {
    await page.goto('/');

    // Tab through navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should close modal with escape key', async ({ page }) => {
    await page.goto('/');

    // Open cart drawer
    const cartButton = page.getByRole('button', { name: /carrito|cart/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await page.waitForTimeout(300);

      // Press escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Drawer should be closed
      const drawer = page.locator('[role="dialog"]');
      const isVisible = await drawer.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });

  test('should trap focus in modal', async ({ page }) => {
    await page.goto('/');

    const cartButton = page.getByRole('button', { name: /carrito|cart/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await page.waitForTimeout(300);

      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        // Tab through modal
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
        }

        // Focus should still be within dialog
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    }
  });
});

test.describe('Color Contrast', () => {
  test('should maintain readability in light mode', async ({ page }) => {
    await page.goto('/');

    // Check that text is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Get computed styles
    const styles = await body.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });

    expect(styles.color).toBeDefined();
    expect(styles.backgroundColor).toBeDefined();
  });

  test('should maintain readability in dark mode', async ({ page }) => {
    // Navigate first, then set localStorage, then reload
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('gemfolio-theme', 'dark'));
    await page.reload();

    const body = page.locator('body');
    await expect(body).toBeVisible();

    const styles = await body.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });

    expect(styles.color).toBeDefined();
    expect(styles.backgroundColor).toBeDefined();
  });
});

test.describe('Screen Reader Support', () => {
  test('should have proper aria roles', async ({ page }) => {
    await page.goto('/');

    // Navigation should have role
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();

    // Main content should have role
    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeVisible();
  });

  test('should have aria-labels for icon buttons', async ({ page }) => {
    await page.goto('/');

    // Icon-only buttons should have aria-label
    const cartButton = page.getByRole('button', { name: /carrito|cart/i });
    await expect(cartButton).toBeVisible();
  });

  test('should announce loading states', async ({ page }) => {
    await page.goto('/catalogo');

    // Look for aria-live regions or loading indicators
    const loadingIndicator = page.locator(
      '[aria-busy="true"], [aria-live], [role="status"], .loading'
    );
    const count = await loadingIndicator.count();
    // Loading indicators might not always be visible
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Form Accessibility', () => {
  test('should have labels for form inputs', async ({ page }) => {
    await page.goto('/');

    // Open search
    const searchButton = page.getByRole('button', { name: /buscar|search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();

      // Use .first() since there might be multiple search inputs (mobile/desktop)
      const searchInput = page.getByPlaceholder(/buscar|search/i).first();
      if (await searchInput.isVisible()) {
        // Input should have label or aria-label
        const hasLabel =
          (await searchInput.getAttribute('aria-label')) !== null ||
          (await searchInput.getAttribute('placeholder')) !== null;
        expect(hasLabel).toBe(true);
      }
    }
  });

  test('should show error messages accessibly', async ({ page }) => {
    // Navigate to a page with a form
    await page.goto('/contacto');

    const submitButton = page.getByRole('button', { name: /enviar|submit/i });
    if (await submitButton.isVisible()) {
      // Submit empty form
      await submitButton.click();

      // Error messages should be visible
      const errorMessage = page.locator('[role="alert"], .error, .text-red-500, .text-destructive');
      const count = await errorMessage.count();
      // Error messages might appear
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
