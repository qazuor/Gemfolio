import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window.matchMedia for theme tests
const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Import after mocks
import {
  $isCartDrawerOpen,
  $isMobileMenuOpen,
  $isSearchOpen,
  $quickViewProductId,
  $searchQuery,
  $theme,
  closeCartDrawer,
  closeMobileMenu,
  closeQuickView,
  closeSearch,
  openCartDrawer,
  openQuickView,
  openSearch,
  setSearchQuery,
  setTheme,
  toggleCartDrawer,
  toggleMobileMenu,
} from '../src/stores/ui';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset all stores
    $theme.set('system');
    $isMobileMenuOpen.set(false);
    $isCartDrawerOpen.set(false);
    $quickViewProductId.set(null);
    $isSearchOpen.set(false);
    $searchQuery.set('');
    document.documentElement.classList.remove('dark');
  });

  describe('Theme', () => {
    it('should have system as default theme', () => {
      expect($theme.get()).toBe('system');
    });

    it('should set light theme', () => {
      setTheme('light');
      expect($theme.get()).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should set dark theme', () => {
      setTheme('dark');
      expect($theme.get()).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should apply system theme based on media query', () => {
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      setTheme('system');
      expect($theme.get()).toBe('system');
      // System preference is dark in mock, so dark class should be added
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should not add dark class when system prefers light', () => {
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: false, // Light mode preferred
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      setTheme('system');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Mobile Menu', () => {
    it('should be closed by default', () => {
      expect($isMobileMenuOpen.get()).toBe(false);
    });

    it('should toggle mobile menu', () => {
      toggleMobileMenu();
      expect($isMobileMenuOpen.get()).toBe(true);

      toggleMobileMenu();
      expect($isMobileMenuOpen.get()).toBe(false);
    });

    it('should close mobile menu', () => {
      $isMobileMenuOpen.set(true);
      closeMobileMenu();
      expect($isMobileMenuOpen.get()).toBe(false);
    });

    it('should do nothing when closing already closed menu', () => {
      closeMobileMenu();
      expect($isMobileMenuOpen.get()).toBe(false);
    });
  });

  describe('Cart Drawer', () => {
    it('should be closed by default', () => {
      expect($isCartDrawerOpen.get()).toBe(false);
    });

    it('should open cart drawer', () => {
      openCartDrawer();
      expect($isCartDrawerOpen.get()).toBe(true);
    });

    it('should close cart drawer', () => {
      $isCartDrawerOpen.set(true);
      closeCartDrawer();
      expect($isCartDrawerOpen.get()).toBe(false);
    });

    it('should toggle cart drawer', () => {
      toggleCartDrawer();
      expect($isCartDrawerOpen.get()).toBe(true);

      toggleCartDrawer();
      expect($isCartDrawerOpen.get()).toBe(false);
    });
  });

  describe('Quick View Modal', () => {
    it('should have no product by default', () => {
      expect($quickViewProductId.get()).toBeNull();
    });

    it('should open quick view with product id', () => {
      openQuickView('product-123');
      expect($quickViewProductId.get()).toBe('product-123');
    });

    it('should close quick view', () => {
      $quickViewProductId.set('product-123');
      closeQuickView();
      expect($quickViewProductId.get()).toBeNull();
    });

    it('should update quick view product', () => {
      openQuickView('product-1');
      expect($quickViewProductId.get()).toBe('product-1');

      openQuickView('product-2');
      expect($quickViewProductId.get()).toBe('product-2');
    });
  });

  describe('Search', () => {
    it('should be closed by default', () => {
      expect($isSearchOpen.get()).toBe(false);
      expect($searchQuery.get()).toBe('');
    });

    it('should open search', () => {
      openSearch();
      expect($isSearchOpen.get()).toBe(true);
    });

    it('should close search and clear query', () => {
      $isSearchOpen.set(true);
      $searchQuery.set('test query');

      closeSearch();

      expect($isSearchOpen.get()).toBe(false);
      expect($searchQuery.get()).toBe('');
    });

    it('should set search query', () => {
      setSearchQuery('anillo oro');
      expect($searchQuery.get()).toBe('anillo oro');
    });

    it('should update search query', () => {
      setSearchQuery('first query');
      expect($searchQuery.get()).toBe('first query');

      setSearchQuery('second query');
      expect($searchQuery.get()).toBe('second query');
    });

    it('should allow empty search query', () => {
      setSearchQuery('some query');
      setSearchQuery('');
      expect($searchQuery.get()).toBe('');
    });
  });
});
