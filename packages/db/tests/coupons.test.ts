import { describe, expect, it } from 'vitest';

import { calculateDiscount } from '../src/queries/coupons';
import type { Coupon } from '../src/schema/coupons';

// Mock coupon factory
function createMockCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 'test-coupon-id',
    code: 'TEST10',
    type: 'percentage',
    value: '10',
    description: 'Test coupon',
    minimumPurchase: null,
    maximumDiscount: null,
    usageLimit: null,
    usageCount: 0,
    validFrom: null,
    validUntil: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('calculateDiscount', () => {
  describe('percentage discount', () => {
    it('should calculate percentage discount correctly', () => {
      const coupon = createMockCoupon({
        type: 'percentage',
        value: '10',
      });

      const discount = calculateDiscount(coupon, 100);
      expect(discount).toBe(10);
    });

    it('should calculate percentage discount with decimals', () => {
      const coupon = createMockCoupon({
        type: 'percentage',
        value: '15',
      });

      const discount = calculateDiscount(coupon, 133.33);
      expect(discount).toBe(20);
    });

    it('should apply maximum discount limit', () => {
      const coupon = createMockCoupon({
        type: 'percentage',
        value: '50',
        maximumDiscount: '25',
      });

      const discount = calculateDiscount(coupon, 100);
      expect(discount).toBe(25);
    });

    it('should not apply maximum discount if under limit', () => {
      const coupon = createMockCoupon({
        type: 'percentage',
        value: '10',
        maximumDiscount: '50',
      });

      const discount = calculateDiscount(coupon, 100);
      expect(discount).toBe(10);
    });
  });

  describe('fixed discount', () => {
    it('should calculate fixed discount correctly', () => {
      const coupon = createMockCoupon({
        type: 'fixed',
        value: '20',
      });

      const discount = calculateDiscount(coupon, 100);
      expect(discount).toBe(20);
    });

    it('should not exceed cart total', () => {
      const coupon = createMockCoupon({
        type: 'fixed',
        value: '100',
      });

      const discount = calculateDiscount(coupon, 50);
      expect(discount).toBe(50);
    });

    it('should return full amount if cart equals discount', () => {
      const coupon = createMockCoupon({
        type: 'fixed',
        value: '50',
      });

      const discount = calculateDiscount(coupon, 50);
      expect(discount).toBe(50);
    });
  });

  describe('free shipping', () => {
    it('should return 0 for free shipping type', () => {
      const coupon = createMockCoupon({
        type: 'free_shipping',
        value: '0',
      });

      const discount = calculateDiscount(coupon, 100);
      expect(discount).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero cart total', () => {
      const coupon = createMockCoupon({
        type: 'percentage',
        value: '10',
      });

      const discount = calculateDiscount(coupon, 0);
      expect(discount).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const coupon = createMockCoupon({
        type: 'percentage',
        value: '33',
      });

      const discount = calculateDiscount(coupon, 100);
      expect(discount).toBe(33);
    });
  });
});
