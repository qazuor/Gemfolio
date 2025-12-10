import { beforeEach, describe, expect, it } from 'vitest';
import {
  $wishlist,
  $wishlistCount,
  $wishlistProductIds,
  $wishlistSynced,
  addToWishlistLocal,
  clearWishlistLocal,
  getAvailableWishlistProducts,
  getOutOfStockWishlistProducts,
  isInWishlist,
  markWishlistUnsynced,
  removeFromWishlistLocal,
  setWishlistFromServer,
  toggleWishlistLocal,
  type WishlistProduct,
} from '../../src/stores/wishlist';

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
  overrides: Partial<WishlistProduct> = {}
): WishlistProduct => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  price: 100,
  image: `/images/${id}.jpg`,
  stock: 10,
  status: 'active',
  ...overrides,
});

describe('Wishlist Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    $wishlist.set([]);
    $wishlistSynced.set(false);
  });

  describe('addToWishlistLocal', () => {
    it('should add a product to the wishlist', () => {
      const product = createMockProduct('1');

      const result = addToWishlistLocal(product);

      expect(result).toBe(true);
      expect($wishlist.get()).toHaveLength(1);
      expect($wishlist.get()[0]).toEqual(product);
    });

    it('should not add duplicate products', () => {
      const product = createMockProduct('1');

      addToWishlistLocal(product);
      const result = addToWishlistLocal(product);

      expect(result).toBe(false);
      expect($wishlist.get()).toHaveLength(1);
    });

    it('should allow unlimited items', () => {
      for (let i = 0; i < 100; i++) {
        addToWishlistLocal(createMockProduct(`${i}`));
      }

      expect($wishlist.get()).toHaveLength(100);
    });
  });

  describe('removeFromWishlistLocal', () => {
    it('should remove a product from the wishlist', () => {
      const product1 = createMockProduct('1');
      const product2 = createMockProduct('2');

      addToWishlistLocal(product1);
      addToWishlistLocal(product2);

      removeFromWishlistLocal('1');

      expect($wishlist.get()).toHaveLength(1);
      expect($wishlist.get()[0]?.id).toBe('2');
    });

    it('should handle removing non-existent product', () => {
      const product = createMockProduct('1');
      addToWishlistLocal(product);

      removeFromWishlistLocal('non-existent');

      expect($wishlist.get()).toHaveLength(1);
    });
  });

  describe('toggleWishlistLocal', () => {
    it('should add product when not in wishlist', () => {
      const product = createMockProduct('1');

      const added = toggleWishlistLocal(product);

      expect(added).toBe(true);
      expect($wishlist.get()).toHaveLength(1);
    });

    it('should remove product when in wishlist', () => {
      const product = createMockProduct('1');
      addToWishlistLocal(product);

      const added = toggleWishlistLocal(product);

      expect(added).toBe(false);
      expect($wishlist.get()).toHaveLength(0);
    });
  });

  describe('clearWishlistLocal', () => {
    it('should remove all products', () => {
      addToWishlistLocal(createMockProduct('1'));
      addToWishlistLocal(createMockProduct('2'));

      clearWishlistLocal();

      expect($wishlist.get()).toHaveLength(0);
    });

    it('should mark wishlist as unsynced', () => {
      $wishlistSynced.set(true);

      clearWishlistLocal();

      expect($wishlistSynced.get()).toBe(false);
    });
  });

  describe('isInWishlist', () => {
    it('should return true for products in wishlist', () => {
      addToWishlistLocal(createMockProduct('1'));

      expect(isInWishlist('1')).toBe(true);
    });

    it('should return false for products not in wishlist', () => {
      addToWishlistLocal(createMockProduct('1'));

      expect(isInWishlist('2')).toBe(false);
    });
  });

  describe('server sync', () => {
    it('should set wishlist from server', () => {
      const products = [createMockProduct('1'), createMockProduct('2')];

      setWishlistFromServer(products);

      expect($wishlist.get()).toEqual(products);
      expect($wishlistSynced.get()).toBe(true);
    });

    it('should mark wishlist as unsynced', () => {
      $wishlistSynced.set(true);

      markWishlistUnsynced();

      expect($wishlistSynced.get()).toBe(false);
    });
  });

  describe('computed values', () => {
    it('$wishlistCount should return the number of products', () => {
      addToWishlistLocal(createMockProduct('1'));
      addToWishlistLocal(createMockProduct('2'));

      expect($wishlistCount.get()).toBe(2);
    });

    it('$wishlistProductIds should return array of product IDs', () => {
      addToWishlistLocal(createMockProduct('1'));
      addToWishlistLocal(createMockProduct('2'));

      expect($wishlistProductIds.get()).toEqual(['1', '2']);
    });
  });

  describe('availability filters', () => {
    it('getAvailableWishlistProducts should return in-stock active products', () => {
      addToWishlistLocal(createMockProduct('1', { status: 'active', stock: 10 }));
      addToWishlistLocal(createMockProduct('2', { status: 'archived', stock: 5 }));
      addToWishlistLocal(createMockProduct('3', { status: 'active', stock: 0 }));

      const available = getAvailableWishlistProducts();

      expect(available).toHaveLength(1);
      expect(available[0]?.id).toBe('1');
    });

    it('getOutOfStockWishlistProducts should return out-of-stock or inactive products', () => {
      addToWishlistLocal(createMockProduct('1', { status: 'active', stock: 10 }));
      addToWishlistLocal(createMockProduct('2', { status: 'archived', stock: 5 }));
      addToWishlistLocal(createMockProduct('3', { status: 'active', stock: 0 }));

      const outOfStock = getOutOfStockWishlistProducts();

      expect(outOfStock).toHaveLength(2);
      expect(outOfStock.map((p) => p.id)).toContain('2');
      expect(outOfStock.map((p) => p.id)).toContain('3');
    });
  });
});
