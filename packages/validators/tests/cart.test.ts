import { describe, expect, it } from 'vitest';
import {
  addToCartSchema,
  applyCouponSchema,
  getCartSchema,
  mergCartsSchema,
  updateCartItemSchema,
} from '../src/cart';

describe('Cart Validators', () => {
  describe('addToCartSchema', () => {
    it('should accept valid add to cart data', () => {
      const result = addToCartSchema.parse({ productId: 'prod-1' });
      expect(result.productId).toBe('prod-1');
      expect(result.quantity).toBe(1);
    });

    it('should accept add to cart with all fields', () => {
      const data = {
        productId: 'prod-1',
        variantId: 'var-1',
        bundleId: 'bundle-1',
        quantity: 3,
      };
      const result = addToCartSchema.parse(data);
      expect(result.productId).toBe('prod-1');
      expect(result.variantId).toBe('var-1');
      expect(result.bundleId).toBe('bundle-1');
      expect(result.quantity).toBe(3);
    });

    it('should reject empty productId', () => {
      expect(() => addToCartSchema.parse({ productId: '' })).toThrow();
    });

    it('should reject quantity less than 1', () => {
      expect(() => addToCartSchema.parse({ productId: 'prod-1', quantity: 0 })).toThrow();
      expect(() => addToCartSchema.parse({ productId: 'prod-1', quantity: -1 })).toThrow();
    });

    it('should reject non-integer quantity', () => {
      expect(() => addToCartSchema.parse({ productId: 'prod-1', quantity: 1.5 })).toThrow();
    });
  });

  describe('updateCartItemSchema', () => {
    it('should accept valid quantity update', () => {
      const result = updateCartItemSchema.parse({ quantity: 5 });
      expect(result.quantity).toBe(5);
    });

    it('should reject quantity less than 1', () => {
      expect(() => updateCartItemSchema.parse({ quantity: 0 })).toThrow();
    });

    it('should reject negative quantity', () => {
      expect(() => updateCartItemSchema.parse({ quantity: -1 })).toThrow();
    });

    it('should reject non-integer quantity', () => {
      expect(() => updateCartItemSchema.parse({ quantity: 2.5 })).toThrow();
    });
  });

  describe('applyCouponSchema', () => {
    it('should accept valid coupon code', () => {
      const result = applyCouponSchema.parse({ code: 'DESCUENTO10' });
      expect(result.code).toBe('DESCUENTO10');
    });

    it('should reject empty code', () => {
      expect(() => applyCouponSchema.parse({ code: '' })).toThrow();
    });

    it('should reject code exceeding max length', () => {
      const longCode = 'A'.repeat(51);
      expect(() => applyCouponSchema.parse({ code: longCode })).toThrow();
    });
  });

  describe('getCartSchema', () => {
    it('should accept userId only', () => {
      const result = getCartSchema.parse({ userId: 'user-1' });
      expect(result.userId).toBe('user-1');
    });

    it('should accept visitorId only', () => {
      const result = getCartSchema.parse({ visitorId: 'visitor-1' });
      expect(result.visitorId).toBe('visitor-1');
    });

    it('should accept both userId and visitorId', () => {
      const result = getCartSchema.parse({
        userId: 'user-1',
        visitorId: 'visitor-1',
      });
      expect(result.userId).toBe('user-1');
      expect(result.visitorId).toBe('visitor-1');
    });

    it('should reject empty object', () => {
      expect(() => getCartSchema.parse({})).toThrow();
    });

    it('should reject when neither userId nor visitorId is provided', () => {
      expect(() => getCartSchema.parse({ userId: undefined, visitorId: undefined })).toThrow();
    });
  });

  describe('mergCartsSchema', () => {
    it('should accept valid merge data', () => {
      const result = mergCartsSchema.parse({
        visitorId: 'visitor-1',
        userId: 'user-1',
      });
      expect(result.visitorId).toBe('visitor-1');
      expect(result.userId).toBe('user-1');
    });

    it('should reject empty visitorId', () => {
      expect(() => mergCartsSchema.parse({ visitorId: '', userId: 'user-1' })).toThrow();
    });

    it('should reject empty userId', () => {
      expect(() => mergCartsSchema.parse({ visitorId: 'visitor-1', userId: '' })).toThrow();
    });

    it('should reject missing visitorId', () => {
      expect(() => mergCartsSchema.parse({ userId: 'user-1' })).toThrow();
    });

    it('should reject missing userId', () => {
      expect(() => mergCartsSchema.parse({ visitorId: 'visitor-1' })).toThrow();
    });
  });
});
