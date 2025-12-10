import { beforeEach, describe, expect, it } from 'vitest';
import {
  $canAddToCompare,
  $comparator,
  $compareCount,
  $compareProductIds,
  addToCompare,
  type CompareProduct,
  clearComparator,
  getCompareAttributes,
  getComparisonData,
  isInComparator,
  MAX_COMPARE_ITEMS,
  removeFromCompare,
  toggleCompare,
} from '../../src/stores/comparator';

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

const createMockProduct = (
  id: string,
  overrides: Partial<CompareProduct> = {}
): CompareProduct => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  price: 100,
  image: `/images/${id}.jpg`,
  attributes: {
    material: 'Gold',
    weight: 10,
  },
  ...overrides,
});

describe('Comparator Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    $comparator.set([]);
  });

  describe('addToCompare', () => {
    it('should add a product to the comparator', () => {
      const product = createMockProduct('1');

      const result = addToCompare(product);

      expect(result).toBe(true);
      expect($comparator.get()).toHaveLength(1);
      expect($comparator.get()[0]).toEqual(product);
    });

    it('should not add duplicate products', () => {
      const product = createMockProduct('1');

      addToCompare(product);
      const result = addToCompare(product);

      expect(result).toBe(false);
      expect($comparator.get()).toHaveLength(1);
    });

    it('should not exceed max items', () => {
      for (let i = 0; i < MAX_COMPARE_ITEMS; i++) {
        addToCompare(createMockProduct(`${i}`));
      }

      const result = addToCompare(createMockProduct('extra'));

      expect(result).toBe(false);
      expect($comparator.get()).toHaveLength(MAX_COMPARE_ITEMS);
    });
  });

  describe('removeFromCompare', () => {
    it('should remove a product from the comparator', () => {
      const product1 = createMockProduct('1');
      const product2 = createMockProduct('2');

      addToCompare(product1);
      addToCompare(product2);

      removeFromCompare('1');

      expect($comparator.get()).toHaveLength(1);
      expect($comparator.get()[0]?.id).toBe('2');
    });

    it('should handle removing non-existent product', () => {
      const product = createMockProduct('1');
      addToCompare(product);

      removeFromCompare('non-existent');

      expect($comparator.get()).toHaveLength(1);
    });
  });

  describe('toggleCompare', () => {
    it('should add product when not in comparator', () => {
      const product = createMockProduct('1');

      const added = toggleCompare(product);

      expect(added).toBe(true);
      expect($comparator.get()).toHaveLength(1);
    });

    it('should remove product when in comparator', () => {
      const product = createMockProduct('1');
      addToCompare(product);

      const added = toggleCompare(product);

      expect(added).toBe(false);
      expect($comparator.get()).toHaveLength(0);
    });

    it('should return false when at max and trying to add', () => {
      for (let i = 0; i < MAX_COMPARE_ITEMS; i++) {
        addToCompare(createMockProduct(`${i}`));
      }

      const newProduct = createMockProduct('extra');
      const added = toggleCompare(newProduct);

      expect(added).toBe(false);
      expect($comparator.get()).toHaveLength(MAX_COMPARE_ITEMS);
    });
  });

  describe('clearComparator', () => {
    it('should remove all products', () => {
      addToCompare(createMockProduct('1'));
      addToCompare(createMockProduct('2'));

      clearComparator();

      expect($comparator.get()).toHaveLength(0);
    });
  });

  describe('isInComparator', () => {
    it('should return true for products in comparator', () => {
      addToCompare(createMockProduct('1'));

      expect(isInComparator('1')).toBe(true);
    });

    it('should return false for products not in comparator', () => {
      addToCompare(createMockProduct('1'));

      expect(isInComparator('2')).toBe(false);
    });
  });

  describe('computed values', () => {
    it('$compareCount should return the number of products', () => {
      addToCompare(createMockProduct('1'));
      addToCompare(createMockProduct('2'));

      expect($compareCount.get()).toBe(2);
    });

    it('$canAddToCompare should return true when under max', () => {
      addToCompare(createMockProduct('1'));

      expect($canAddToCompare.get()).toBe(true);
    });

    it('$canAddToCompare should return false when at max', () => {
      for (let i = 0; i < MAX_COMPARE_ITEMS; i++) {
        addToCompare(createMockProduct(`${i}`));
      }

      expect($canAddToCompare.get()).toBe(false);
    });

    it('$compareProductIds should return array of product IDs', () => {
      addToCompare(createMockProduct('1'));
      addToCompare(createMockProduct('2'));

      expect($compareProductIds.get()).toEqual(['1', '2']);
    });
  });

  describe('getCompareAttributes', () => {
    it('should return unique attributes from all products', () => {
      addToCompare(createMockProduct('1', { attributes: { material: 'Gold', weight: 10 } }));
      addToCompare(createMockProduct('2', { attributes: { material: 'Silver', color: 'White' } }));

      const attributes = getCompareAttributes();

      expect(attributes).toContain('material');
      expect(attributes).toContain('weight');
      expect(attributes).toContain('color');
      expect(attributes).toHaveLength(3);
    });

    it('should return empty array when no products', () => {
      expect(getCompareAttributes()).toEqual([]);
    });
  });

  describe('getComparisonData', () => {
    it('should return products and organized attributes', () => {
      addToCompare(createMockProduct('1', { attributes: { material: 'Gold', weight: 10 } }));
      addToCompare(createMockProduct('2', { attributes: { material: 'Silver', weight: 15 } }));

      const data = getComparisonData();

      expect(data.products).toHaveLength(2);
      expect(data.attributes).toHaveLength(2); // material, weight

      const materialAttr = data.attributes.find((a) => a.name === 'material');
      expect(materialAttr?.values).toEqual([
        { productId: '1', value: 'Gold' },
        { productId: '2', value: 'Silver' },
      ]);
    });

    it('should handle missing attributes with null', () => {
      addToCompare(createMockProduct('1', { attributes: { material: 'Gold' } }));
      addToCompare(createMockProduct('2', { attributes: { weight: 15 } }));

      const data = getComparisonData();

      const materialAttr = data.attributes.find((a) => a.name === 'material');
      expect(materialAttr?.values).toEqual([
        { productId: '1', value: 'Gold' },
        { productId: '2', value: null },
      ]);
    });
  });
});
