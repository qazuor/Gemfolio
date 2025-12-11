import { describe, expect, it, vi } from 'vitest';

import {
  type CouponFilters,
  type CouponPaginationOptions,
  calculateDiscount,
  createCoupon,
  deleteCoupon,
  getCouponByCode,
  getCouponById,
  getCoupons,
  incrementCouponUsage,
  toggleCouponStatus,
  updateCoupon,
  validateCoupon,
} from '../src/queries/coupons';
import type { Coupon, NewCoupon } from '../src/schema/coupons';

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
    usagePerUser: 1,
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

describe('validateCoupon', () => {
  it('should return error for non-existent coupon', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    const result = await validateCoupon(mockDb as any, 'INVALID', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Cupón no encontrado');
  });

  it('should return error for inactive coupon', async () => {
    const inactiveCoupon = createMockCoupon({ isActive: false });
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([inactiveCoupon]),
          }),
        }),
      }),
    };

    const result = await validateCoupon(mockDb as any, 'TEST10', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Cupón inactivo');
  });

  it('should return error for coupon not yet valid', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureCoupon = createMockCoupon({ validFrom: futureDate });

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([futureCoupon]),
          }),
        }),
      }),
    };

    const result = await validateCoupon(mockDb as any, 'TEST10', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Cupón aún no es válido');
  });

  it('should return error for expired coupon', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const expiredCoupon = createMockCoupon({ validUntil: pastDate });

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([expiredCoupon]),
          }),
        }),
      }),
    };

    const result = await validateCoupon(mockDb as any, 'TEST10', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Cupón expirado');
  });

  it('should return error for exhausted coupon', async () => {
    const exhaustedCoupon = createMockCoupon({ usageLimit: 10, usageCount: 10 });

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([exhaustedCoupon]),
          }),
        }),
      }),
    };

    const result = await validateCoupon(mockDb as any, 'TEST10', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Cupón agotado');
  });

  it('should return error for minimum purchase not met', async () => {
    const minPurchaseCoupon = createMockCoupon({ minimumPurchase: '100.00' });

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([minPurchaseCoupon]),
          }),
        }),
      }),
    };

    const result = await validateCoupon(mockDb as any, 'TEST10', 50);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Compra mínima requerida');
  });

  it('should return valid for a valid coupon', async () => {
    const validCoupon = createMockCoupon();

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([validCoupon]),
          }),
        }),
      }),
    };

    const result = await validateCoupon(mockDb as any, 'TEST10', 100);
    expect(result.valid).toBe(true);
    expect(result.coupon).toBeDefined();
  });
});

describe('getCouponById', () => {
  it('should return coupon when found', async () => {
    const mockCoupon = createMockCoupon();
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockCoupon]),
          }),
        }),
      }),
    };

    const result = await getCouponById(mockDb as any, 'test-id');
    expect(result).toEqual(mockCoupon);
  });

  it('should return null when not found', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    const result = await getCouponById(mockDb as any, 'non-existent');
    expect(result).toBeNull();
  });
});

describe('getCouponByCode', () => {
  it('should return coupon when found', async () => {
    const mockCoupon = createMockCoupon();
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockCoupon]),
          }),
        }),
      }),
    };

    const result = await getCouponByCode(mockDb as any, 'test10');
    expect(result).toEqual(mockCoupon);
  });

  it('should return null when not found', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    const result = await getCouponByCode(mockDb as any, 'NOTFOUND');
    expect(result).toBeNull();
  });
});

describe('getCoupons', () => {
  it('should return coupons with pagination', async () => {
    const mockCoupons = [createMockCoupon(), createMockCoupon({ id: 'second' })];
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockCoupons),
              }),
            }),
          }),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue(mockCoupons),
            }),
          }),
        }),
      }),
    };

    // Mock for count query
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockCoupons),
              }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 2 }]),
        }),
      });

    const result = await getCoupons(mockDb as any, {}, { page: 1, limit: 10 });
    expect(result.items).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });
});

describe('createCoupon', () => {
  it('should create a coupon with uppercase code', async () => {
    const newCoupon: NewCoupon = {
      code: 'test123',
      type: 'percentage',
      value: '10',
    };
    const createdCoupon = createMockCoupon({ code: 'TEST123' });

    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdCoupon]),
        }),
      }),
    };

    const result = await createCoupon(mockDb as any, newCoupon);
    expect(result.code).toBe('TEST123');
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should throw error when creation fails', async () => {
    const newCoupon: NewCoupon = {
      code: 'test123',
      type: 'percentage',
      value: '10',
    };

    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    };

    await expect(createCoupon(mockDb as any, newCoupon)).rejects.toThrow('Failed to create coupon');
  });
});

describe('updateCoupon', () => {
  it('should update coupon and return it', async () => {
    const updatedCoupon = createMockCoupon({ description: 'Updated' });

    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedCoupon]),
          }),
        }),
      }),
    };

    const result = await updateCoupon(mockDb as any, 'test-id', { description: 'Updated' });
    expect(result?.description).toBe('Updated');
  });

  it('should uppercase code when updating', async () => {
    const updatedCoupon = createMockCoupon({ code: 'NEWCODE' });

    const mockSet = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([updatedCoupon]),
      }),
    });

    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: mockSet,
      }),
    };

    await updateCoupon(mockDb as any, 'test-id', { code: 'newcode' });
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ code: 'NEWCODE' }));
  });

  it('should return null when coupon not found', async () => {
    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    const result = await updateCoupon(mockDb as any, 'non-existent', { description: 'Updated' });
    expect(result).toBeNull();
  });
});

describe('deleteCoupon', () => {
  it('should return true when coupon deleted', async () => {
    const mockDb = {
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
        }),
      }),
    };

    const result = await deleteCoupon(mockDb as any, 'test-id');
    expect(result).toBe(true);
  });

  it('should return false when coupon not found', async () => {
    const mockDb = {
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    };

    const result = await deleteCoupon(mockDb as any, 'non-existent');
    expect(result).toBe(false);
  });
});

describe('incrementCouponUsage', () => {
  it('should call update with incremented usage count', async () => {
    const mockWhere = vi.fn();
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: mockSet,
      }),
    };

    await incrementCouponUsage(mockDb as any, 'test-id');
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();
  });
});

describe('toggleCouponStatus', () => {
  it('should toggle active status from true to false', async () => {
    const activeCoupon = createMockCoupon({ isActive: true });
    const toggledCoupon = createMockCoupon({ isActive: false });

    // First call for getCouponById, second for update
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([activeCoupon]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([toggledCoupon]),
          }),
        }),
      }),
    };

    const result = await toggleCouponStatus(mockDb as any, 'test-id');
    expect(result?.isActive).toBe(false);
  });

  it('should return null when coupon not found', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    const result = await toggleCouponStatus(mockDb as any, 'non-existent');
    expect(result).toBeNull();
  });
});

describe('CouponFilters type', () => {
  it('should allow valid filter combinations', () => {
    const filters: CouponFilters = {
      isActive: true,
      type: 'percentage',
      search: 'test',
      validNow: true,
    };
    expect(filters.isActive).toBe(true);
    expect(filters.type).toBe('percentage');
  });
});

describe('CouponPaginationOptions type', () => {
  it('should allow valid pagination options', () => {
    const pagination: CouponPaginationOptions = {
      page: 1,
      limit: 20,
    };
    expect(pagination.page).toBe(1);
    expect(pagination.limit).toBe(20);
  });
});
