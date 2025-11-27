import { expect, test } from '@playwright/test';

test.describe('Web Home Page', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Gemfolio/i);
  });

  test('should display the logo', async ({ page }) => {
    await page.goto('/');
    const logo = page.getByRole('link', { name: /gemfolio/i });
    await expect(logo).toBeVisible();
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  test('should navigate to catalog', async ({ page }) => {
    await page.goto('/');
    const catalogLink = page.getByRole('link', { name: /catálogo|catalog/i });
    if (await catalogLink.isVisible()) {
      await catalogLink.click();
      await expect(page).toHaveURL(/catalogo|catalog/i);
    }
  });
});

test.describe('Web Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Gemfolio/i);
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Gemfolio/i);
  });
});
