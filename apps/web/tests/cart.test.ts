import { beforeEach, describe, expect, it } from 'vitest';
import {
  $cart,
  $cartItemCount,
  $cartItems,
  $cartSubtotal,
  $cartTotal,
  addToCart,
  applyCoupon,
  clearCart,
  removeCartItem,
  removeCoupon,
  updateCartItemQuantity,
} from '../src/stores/cart';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Cart Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    clearCart();
  });

  describe('addToCart', () => {
    it('should add a new item to cart', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      });

      const items = $cartItems.get();
      expect(items).toHaveLength(1);
      expect(items[0]?.productId).toBe('prod-1');
      expect(items[0]?.name).toBe('Test Product');
      expect(items[0]?.price).toBe(100);
    });

    it('should update quantity when adding existing item', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      });

      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
      });

      const items = $cartItems.get();
      expect(items).toHaveLength(1);
      expect(items[0]?.quantity).toBe(3);
    });

    it('should respect maxQuantity when adding', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 5,
        maxQuantity: 3,
      });

      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
        maxQuantity: 3,
      });

      const items = $cartItems.get();
      expect(items[0]?.quantity).toBe(3);
    });

    it('should add items with different variants separately', () => {
      addToCart({
        productId: 'prod-1',
        variantId: 'var-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      });

      addToCart({
        productId: 'prod-1',
        variantId: 'var-2',
        name: 'Test Product',
        price: 120,
        quantity: 1,
      });

      const items = $cartItems.get();
      expect(items).toHaveLength(2);
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update item quantity', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      });

      const items = $cartItems.get();
      const itemId = items[0]?.id ?? '';

      updateCartItemQuantity(itemId, 5);

      expect($cartItems.get()[0]?.quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
      });

      const items = $cartItems.get();
      const itemId = items[0]?.id ?? '';

      updateCartItemQuantity(itemId, 0);

      expect($cartItems.get()).toHaveLength(0);
    });
  });

  describe('removeCartItem', () => {
    it('should remove item from cart', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      });

      const items = $cartItems.get();
      const itemId = items[0]?.id ?? '';

      removeCartItem(itemId);

      expect($cartItems.get()).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      });

      addToCart({
        productId: 'prod-2',
        name: 'Test Product 2',
        price: 200,
        quantity: 2,
      });

      clearCart();

      expect($cartItems.get()).toHaveLength(0);
    });
  });

  describe('computed values', () => {
    it('should calculate item count', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
      });

      addToCart({
        productId: 'prod-2',
        name: 'Test Product 2',
        price: 200,
        quantity: 3,
      });

      expect($cartItemCount.get()).toBe(5);
    });

    it('should calculate subtotal', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
      });

      addToCart({
        productId: 'prod-2',
        name: 'Test Product 2',
        price: 200,
        quantity: 1,
      });

      expect($cartSubtotal.get()).toBe(400);
    });

    it('should calculate total with discount', () => {
      addToCart({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
      });

      applyCoupon('SAVE50', 50);

      expect($cartSubtotal.get()).toBe(200);
      expect($cartTotal.get()).toBe(150);
    });
  });

  describe('coupon management', () => {
    it('should apply coupon', () => {
      applyCoupon('DISCOUNT10', 100);

      const cart = $cart.get();
      expect(cart.couponCode).toBe('DISCOUNT10');
      expect(cart.couponDiscount).toBe(100);
    });

    it('should remove coupon', () => {
      applyCoupon('DISCOUNT10', 100);
      removeCoupon();

      const cart = $cart.get();
      expect(cart.couponCode).toBeUndefined();
      expect(cart.couponDiscount).toBeUndefined();
    });
  });
});
