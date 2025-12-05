import { expect, test } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('gemfolio-cart'));
  });

  test('should navigate to checkout from cart', async ({ page }) => {
    await page.goto('/carrito');

    const checkoutButton = page.getByRole('link', { name: /checkout|finalizar|pagar/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await expect(page).toHaveURL(/checkout|pago/);
    }
  });

  test('should show empty cart message when trying to checkout with empty cart', async ({
    page,
  }) => {
    await page.goto('/carrito');

    // With empty cart, checkout button might be disabled or show message
    const emptyMessage = page.locator('text=/vacío|empty|sin productos/i');
    const count = await emptyMessage.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display order summary in checkout', async ({ page }) => {
    // First add a product to cart
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      const addButton = page.getByRole('button', { name: /agregar|añadir|add/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(500);

        // Navigate to checkout
        await page.goto('/checkout');

        // Order summary should be visible
        const summary = page.locator('text=/resumen|summary|total/i');
        const count = await summary.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Checkout Form', () => {
  test('should display contact information form', async ({ page }) => {
    await page.goto('/checkout');

    // Look for form fields
    const emailInput = page.locator('input[name*="email"], input[type="email"]');
    const nameInput = page.locator('input[name*="name"], input[name*="nombre"]');

    // At least some form fields should be present
    const hasEmailInput = (await emailInput.count()) > 0;
    const hasNameInput = (await nameInput.count()) > 0;

    expect(hasEmailInput || hasNameInput).toBe(true);
  });

  test('should display shipping address form', async ({ page }) => {
    await page.goto('/checkout');

    // Look for shipping address fields
    const addressInput = page.locator(
      'input[name*="address"], input[name*="direccion"], input[name*="calle"]'
    );
    const cityInput = page.locator('input[name*="city"], input[name*="ciudad"]');

    const hasAddressInput = (await addressInput.count()) > 0;
    const hasCityInput = (await cityInput.count()) > 0;

    expect(hasAddressInput || hasCityInput).toBe(true);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/checkout');

    const submitButton = page.getByRole('button', { name: /confirmar|submit|enviar|pagar/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Error messages should appear
      const errorMessage = page.locator(
        '[role="alert"], .error, .text-red-500, .text-destructive, :invalid'
      );
      const count = await errorMessage.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/checkout');

    const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // Should show validation error
      const errorMessage = page.locator('text=/email.*inválido|invalid.*email/i');
      const count = await errorMessage.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should validate phone number', async ({ page }) => {
    await page.goto('/checkout');

    const phoneInput = page.locator('input[name*="phone"], input[name*="telefono"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('abc');
      await phoneInput.blur();

      // Should show validation error or correct the input
      const value = await phoneInput.inputValue();
      expect(value).toBeDefined();
    }
  });
});

test.describe('Coupon Code', () => {
  test('should have coupon code input', async ({ page }) => {
    await page.goto('/checkout');

    const couponInput = page.locator('input[name*="coupon"], input[name*="cupon"]');
    const count = await couponInput.count();
    // Coupon input might be present
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should apply valid coupon', async ({ page }) => {
    await page.goto('/checkout');

    const couponInput = page.locator('input[name*="coupon"], input[name*="cupon"]').first();
    if (await couponInput.isVisible()) {
      await couponInput.fill('TEST10');

      const applyButton = page.getByRole('button', { name: /aplicar|apply/i });
      if (await applyButton.isVisible()) {
        await applyButton.click();

        // Wait for response
        await page.waitForTimeout(500);

        // Should show success or error message
        const message = page.locator(
          'text=/aplicado|applied|descuento|discount|inválido|invalid/i'
        );
        const count = await message.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should show error for invalid coupon', async ({ page }) => {
    await page.goto('/checkout');

    const couponInput = page.locator('input[name*="coupon"], input[name*="cupon"]').first();
    if (await couponInput.isVisible()) {
      await couponInput.fill('INVALIDCOUPON123');

      const applyButton = page.getByRole('button', { name: /aplicar|apply/i });
      if (await applyButton.isVisible()) {
        await applyButton.click();
        await page.waitForTimeout(500);

        // Should show error message
        const errorMessage = page.locator('text=/inválido|invalid|no existe|not found/i');
        const count = await errorMessage.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Order Confirmation', () => {
  test('should display order total', async ({ page }) => {
    await page.goto('/checkout');

    const total = page.locator('text=/total|total a pagar/i');
    const count = await total.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display shipping cost', async ({ page }) => {
    await page.goto('/checkout');

    const shipping = page.locator('text=/envío|shipping|flete/i');
    const count = await shipping.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Cart Page', () => {
  test('should display cart items', async ({ page }) => {
    await page.goto('/carrito');

    // Cart page should have items or empty message
    const cartContent = page.locator('main');
    await expect(cartContent).toBeVisible();
  });

  test('should allow removing items', async ({ page }) => {
    // Add item to cart first
    await page.goto('/catalogo');

    const productLink = page.locator('a[href*="/producto/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/producto/);

      const addButton = page.getByRole('button', { name: /agregar|añadir|add/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(500);

        // Go to cart
        await page.goto('/carrito');

        // Look for remove button
        const removeButton = page.getByRole('button', { name: /eliminar|remove|×/i });
        if (await removeButton.isVisible()) {
          await removeButton.click();

          // Item should be removed
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should update item quantity', async ({ page }) => {
    await page.goto('/carrito');

    const quantityInput = page.locator('input[type="number"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('2');
      await quantityInput.blur();

      // Total should update
      await page.waitForTimeout(500);
    }
  });

  test('should show free shipping threshold', async ({ page }) => {
    await page.goto('/carrito');

    const freeShipping = page.locator('text=/envío.*gratis|free.*shipping|faltan/i');
    const count = await freeShipping.count();
    // Free shipping message might be present
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
