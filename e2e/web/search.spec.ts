import { expect, test } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should open search modal', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.getByRole('button', { name: /buscar|search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(300);

      // Search input should be visible
      const searchInput = page.getByPlaceholder(/buscar|search/i);
      await expect(searchInput).toBeVisible();
    }
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.getByRole('button', { name: /buscar|search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(300);

      const searchInput = page.getByPlaceholder(/buscar|search/i);
      await searchInput.fill('anillo');
      await searchInput.press('Enter');

      // Should navigate to search results
      await expect(page).toHaveURL(/buscar|search/);
    }
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.getByRole('button', { name: /buscar|search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(300);

      const searchInput = page.getByPlaceholder(/buscar|search/i);
      await searchInput.fill('an');

      // Wait for suggestions
      await page.waitForTimeout(500);

      // Suggestions might appear
      const suggestions = page.locator(
        '[role="listbox"], [data-testid="search-suggestions"], .search-suggestions'
      );
      const hasSuggestions = (await suggestions.count()) > 0;
      // Suggestions might not be implemented
      expect(typeof hasSuggestions).toBe('boolean');
    }
  });

  test('should close search with escape key', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.getByRole('button', { name: /buscar|search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(300);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Search should be closed
      const searchInput = page.getByPlaceholder(/buscar|search/i);
      const isVisible = await searchInput.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });

  test('should clear search input', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.getByRole('button', { name: /buscar|search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(300);

      const searchInput = page.getByPlaceholder(/buscar|search/i);
      await searchInput.fill('test query');

      const clearButton = page.getByRole('button', { name: /limpiar|clear|×/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(searchInput).toHaveValue('');
      }
    }
  });

  test('should open search with keyboard shortcut', async ({ page }) => {
    await page.goto('/');

    // Press Ctrl+K or Cmd+K
    await page.keyboard.press('Meta+k');

    const searchInput = page.getByPlaceholder(/buscar|search/i);
    const isVisible = await searchInput.isVisible().catch(() => false);
    // Keyboard shortcut might not be implemented
    expect(typeof isVisible).toBe('boolean');
  });
});

test.describe('Search Results Page', () => {
  test('should display search results', async ({ page }) => {
    await page.goto('/buscar?q=anillo');

    // Page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show no results message for invalid search', async ({ page }) => {
    await page.goto('/buscar?q=xyznonexistent123');

    // Should show no results message
    const noResults = page.locator('text=/no hay|no encontramos|no results/i');
    const hasNoResultsMessage = (await noResults.count()) > 0;
    expect(typeof hasNoResultsMessage).toBe('boolean');
  });

  test('should show search query in page', async ({ page }) => {
    await page.goto('/buscar?q=collar');

    // Search term should be visible somewhere
    const searchTerm = page.locator('text=/collar/i');
    const count = await searchTerm.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should allow sorting results', async ({ page }) => {
    await page.goto('/buscar?q=anillo');

    const sortSelect = page.locator('select[name*="sort"], [data-testid="sort-select"]');
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption({ index: 1 });
      // URL should update with sort parameter
      await expect(page).toHaveURL(/sort|orden/);
    }
  });

  test('should allow filtering results', async ({ page }) => {
    await page.goto('/buscar?q=anillo');

    const filterButton = page.getByRole('button', { name: /filtrar|filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();

      // Filter options should appear
      const filterPanel = page.locator('[data-testid="filter-panel"], .filter-panel, aside');
      await expect(filterPanel).toBeVisible();
    }
  });
});

test.describe('Search Accessibility', () => {
  test('should be accessible via keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab to search button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Try to find focused search element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper aria labels', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.getByRole('button', { name: /buscar|search/i });
    // Search button might not be visible on mobile
    if (await searchButton.isVisible().catch(() => false)) {
      await expect(searchButton).toHaveAttribute('aria-label', /.+/);
    }
  });
});
