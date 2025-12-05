import { describe, expect, it } from 'vitest';
import {
  couponFiltersSchema,
  couponTypeSchema,
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from '../src/coupon';

describe('Coupon Validators', () => {
  describe('couponTypeSchema', () => {
    it('should accept valid coupon types', () => {
      expect(couponTypeSchema.parse('percentage')).toBe('percentage');
      expect(couponTypeSchema.parse('fixed')).toBe('fixed');
      expect(couponTypeSchema.parse('free_shipping')).toBe('free_shipping');
    });

    it('should reject invalid coupon types', () => {
      expect(() => couponTypeSchema.parse('invalid')).toThrow();
      expect(() => couponTypeSchema.parse('')).toThrow();
    });
  });

  describe('createCouponSchema', () => {
    const validCoupon = {
      code: 'DESCUENTO10',
      type: 'percentage',
      value: '10',
    };

    it('should accept valid coupon', () => {
      const result = createCouponSchema.parse(validCoupon);
      expect(result.code).toBe('DESCUENTO10');
      expect(result.type).toBe('percentage');
      expect(result.value).toBe('10');
      expect(result.usageCount).toBe(0);
      expect(result.isActive).toBe(true);
    });

    it('should accept coupon with all fields', () => {
      const fullCoupon = {
        code: 'VERANO2024',
        description: 'Descuento de verano',
        type: 'fixed',
        value: '500',
        minPurchase: '2000',
        maxDiscount: '1000',
        usageLimit: 100,
        usageCount: 10,
        validFrom: '2024-01-01T00:00:00.000Z',
        validUntil: '2024-12-31T23:59:59.999Z',
        isActive: true,
      };
      const result = createCouponSchema.parse(fullCoupon);
      expect(result.description).toBe('Descuento de verano');
      expect(result.minPurchase).toBe('2000');
      expect(result.maxDiscount).toBe('1000');
      expect(result.usageLimit).toBe(100);
    });

    it('should accept code with dashes and underscores', () => {
      const result = createCouponSchema.parse({
        ...validCoupon,
        code: 'VERANO_2024-DESC',
      });
      expect(result.code).toBe('VERANO_2024-DESC');
    });

    it('should reject code too short', () => {
      expect(() => createCouponSchema.parse({ ...validCoupon, code: 'AB' })).toThrow();
    });

    it('should reject lowercase code', () => {
      expect(() => createCouponSchema.parse({ ...validCoupon, code: 'descuento' })).toThrow();
    });

    it('should reject code with spaces', () => {
      expect(() => createCouponSchema.parse({ ...validCoupon, code: 'DESC UENTO' })).toThrow();
    });

    it('should reject invalid value format', () => {
      expect(() => createCouponSchema.parse({ ...validCoupon, value: 'invalid' })).toThrow();
    });

    it('should reject percentage above 100', () => {
      expect(() =>
        createCouponSchema.parse({ ...validCoupon, type: 'percentage', value: '101' })
      ).toThrow();
    });

    it('should accept percentage at 100', () => {
      const result = createCouponSchema.parse({
        ...validCoupon,
        type: 'percentage',
        value: '100',
      });
      expect(result.value).toBe('100');
    });

    it('should accept percentage at 1', () => {
      const result = createCouponSchema.parse({
        ...validCoupon,
        type: 'percentage',
        value: '1',
      });
      expect(result.value).toBe('1');
    });

    it('should accept fixed coupon with any value', () => {
      const result = createCouponSchema.parse({
        ...validCoupon,
        type: 'fixed',
        value: '1000',
      });
      expect(result.value).toBe('1000');
    });

    it('should accept free_shipping coupon', () => {
      const result = createCouponSchema.parse({
        ...validCoupon,
        type: 'free_shipping',
        value: '0',
      });
      expect(result.type).toBe('free_shipping');
    });

    it('should reject invalid minPurchase format', () => {
      expect(() => createCouponSchema.parse({ ...validCoupon, minPurchase: 'invalid' })).toThrow();
    });

    it('should reject invalid maxDiscount format', () => {
      expect(() => createCouponSchema.parse({ ...validCoupon, maxDiscount: 'invalid' })).toThrow();
    });

    it('should reject usageLimit less than 1', () => {
      expect(() => createCouponSchema.parse({ ...validCoupon, usageLimit: 0 })).toThrow();
    });

    it('should reject negative usageCount', () => {
      expect(() => createCouponSchema.parse({ ...validCoupon, usageCount: -1 })).toThrow();
    });

    it('should reject description exceeding max length', () => {
      const longDesc = 'a'.repeat(501);
      expect(() => createCouponSchema.parse({ ...validCoupon, description: longDesc })).toThrow();
    });
  });

  describe('updateCouponSchema', () => {
    it('should accept partial updates', () => {
      const result = updateCouponSchema.parse({ isActive: false });
      expect(result.isActive).toBe(false);
    });

    it('should accept empty object', () => {
      const result = updateCouponSchema.parse({});
      expect(result).toEqual({});
    });

    it('should still validate provided fields', () => {
      expect(() => updateCouponSchema.parse({ code: 'invalid code' })).toThrow();
    });
  });

  describe('validateCouponSchema', () => {
    it('should accept valid coupon validation', () => {
      const result = validateCouponSchema.parse({
        code: 'DESCUENTO10',
        cartTotal: 5000,
      });
      expect(result.code).toBe('DESCUENTO10');
      expect(result.cartTotal).toBe(5000);
    });

    it('should reject empty code', () => {
      expect(() => validateCouponSchema.parse({ code: '', cartTotal: 5000 })).toThrow();
    });

    it('should reject negative cartTotal', () => {
      expect(() => validateCouponSchema.parse({ code: 'DESC', cartTotal: -100 })).toThrow();
    });

    it('should accept cartTotal of 0', () => {
      const result = validateCouponSchema.parse({ code: 'DESC', cartTotal: 0 });
      expect(result.cartTotal).toBe(0);
    });
  });

  describe('couponFiltersSchema', () => {
    it('should accept valid filters', () => {
      const filters = {
        isActive: true,
        type: 'percentage',
        search: 'verano',
        validNow: true,
      };
      const result = couponFiltersSchema.parse(filters);
      expect(result).toEqual(filters);
    });

    it('should accept empty filters', () => {
      const result = couponFiltersSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject invalid type', () => {
      expect(() => couponFiltersSchema.parse({ type: 'invalid' })).toThrow();
    });
  });
});
