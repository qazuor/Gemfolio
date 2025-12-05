import { describe, expect, it } from 'vitest';
import {
  bundleFiltersSchema,
  bundleItemSchema,
  bundleStatusSchema,
  createBundleSchema,
  updateBundleSchema,
} from '../src/bundle';

describe('Bundle Validators', () => {
  describe('bundleStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(bundleStatusSchema.parse('draft')).toBe('draft');
      expect(bundleStatusSchema.parse('active')).toBe('active');
      expect(bundleStatusSchema.parse('archived')).toBe('archived');
    });

    it('should reject invalid statuses', () => {
      expect(() => bundleStatusSchema.parse('invalid')).toThrow();
      expect(() => bundleStatusSchema.parse('')).toThrow();
    });
  });

  describe('bundleItemSchema', () => {
    it('should accept valid bundle item', () => {
      const result = bundleItemSchema.parse({ productId: 'prod-1' });
      expect(result.productId).toBe('prod-1');
      expect(result.quantity).toBe(1);
    });

    it('should accept bundle item with all fields', () => {
      const item = {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 3,
      };
      const result = bundleItemSchema.parse(item);
      expect(result.productId).toBe('prod-1');
      expect(result.variantId).toBe('var-1');
      expect(result.quantity).toBe(3);
    });

    it('should accept null variantId', () => {
      const result = bundleItemSchema.parse({
        productId: 'prod-1',
        variantId: null,
      });
      expect(result.variantId).toBeNull();
    });

    it('should reject empty productId', () => {
      expect(() => bundleItemSchema.parse({ productId: '' })).toThrow();
    });

    it('should reject quantity less than 1', () => {
      expect(() => bundleItemSchema.parse({ productId: 'prod-1', quantity: 0 })).toThrow();
    });

    it('should reject non-integer quantity', () => {
      expect(() => bundleItemSchema.parse({ productId: 'prod-1', quantity: 1.5 })).toThrow();
    });
  });

  describe('createBundleSchema', () => {
    const validBundle = {
      name: 'Combo Anillos',
      slug: 'combo-anillos',
      price: '2500.00',
      items: [
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 1 },
      ],
    };

    it('should accept valid bundle', () => {
      const result = createBundleSchema.parse(validBundle);
      expect(result.name).toBe('Combo Anillos');
      expect(result.slug).toBe('combo-anillos');
      expect(result.price).toBe('2500.00');
      expect(result.status).toBe('draft');
      expect(result.items).toHaveLength(2);
    });

    it('should accept bundle with all fields', () => {
      const fullBundle = {
        ...validBundle,
        description: 'Combo especial de anillos',
        image: 'https://example.com/combo.jpg',
        comparePrice: '3000.00',
        status: 'active',
        validFrom: '2024-01-01T00:00:00.000Z',
        validUntil: '2024-12-31T23:59:59.999Z',
      };
      const result = createBundleSchema.parse(fullBundle);
      expect(result.description).toBe('Combo especial de anillos');
      expect(result.image).toBe('https://example.com/combo.jpg');
      expect(result.comparePrice).toBe('3000.00');
      expect(result.status).toBe('active');
    });

    it('should reject empty name', () => {
      expect(() => createBundleSchema.parse({ ...validBundle, name: '' })).toThrow();
    });

    it('should reject name exceeding max length', () => {
      const longName = 'a'.repeat(256);
      expect(() => createBundleSchema.parse({ ...validBundle, name: longName })).toThrow();
    });

    it('should reject invalid slug format', () => {
      expect(() => createBundleSchema.parse({ ...validBundle, slug: 'Invalid Slug' })).toThrow();
    });

    it('should reject invalid image URL', () => {
      expect(() => createBundleSchema.parse({ ...validBundle, image: 'not-a-url' })).toThrow();
    });

    it('should accept null image', () => {
      const result = createBundleSchema.parse({ ...validBundle, image: null });
      expect(result.image).toBeNull();
    });

    it('should reject invalid price format', () => {
      expect(() => createBundleSchema.parse({ ...validBundle, price: 'invalid' })).toThrow();
    });

    it('should reject bundle with less than 2 items', () => {
      expect(() =>
        createBundleSchema.parse({
          ...validBundle,
          items: [{ productId: 'prod-1', quantity: 1 }],
        })
      ).toThrow();
    });

    it('should reject bundle with empty items', () => {
      expect(() => createBundleSchema.parse({ ...validBundle, items: [] })).toThrow();
    });

    it('should accept bundle with multiple items', () => {
      const result = createBundleSchema.parse({
        ...validBundle,
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 },
          { productId: 'prod-3', quantity: 3 },
        ],
      });
      expect(result.items).toHaveLength(3);
    });

    it('should accept null validFrom and validUntil', () => {
      const result = createBundleSchema.parse({
        ...validBundle,
        validFrom: null,
        validUntil: null,
      });
      expect(result.validFrom).toBeNull();
      expect(result.validUntil).toBeNull();
    });
  });

  describe('updateBundleSchema', () => {
    it('should accept partial updates', () => {
      const result = updateBundleSchema.parse({ name: 'Updated Bundle' });
      expect(result.name).toBe('Updated Bundle');
    });

    it('should accept empty object', () => {
      const result = updateBundleSchema.parse({});
      expect(result).toEqual({});
    });

    it('should still validate provided fields', () => {
      expect(() => updateBundleSchema.parse({ slug: 'Invalid Slug' })).toThrow();
    });

    it('should enforce minimum items requirement for items update', () => {
      expect(() =>
        updateBundleSchema.parse({
          items: [{ productId: 'prod-1', quantity: 1 }],
        })
      ).toThrow();
    });

    it('should accept valid items update with 2 or more items', () => {
      const result = updateBundleSchema.parse({
        items: [
          { productId: 'prod-1', quantity: 1 },
          { productId: 'prod-2', quantity: 2 },
        ],
      });
      expect(result.items).toHaveLength(2);
    });
  });

  describe('bundleFiltersSchema', () => {
    it('should accept valid filters', () => {
      const filters = {
        status: 'active',
        validNow: true,
        search: 'combo',
      };
      const result = bundleFiltersSchema.parse(filters);
      expect(result).toEqual(filters);
    });

    it('should accept empty filters', () => {
      const result = bundleFiltersSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject invalid status', () => {
      expect(() => bundleFiltersSchema.parse({ status: 'invalid' })).toThrow();
    });
  });
});
