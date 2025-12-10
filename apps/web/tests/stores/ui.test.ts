import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  $isCartDrawerOpen,
  $isMobileMenuOpen,
  $isSearchOpen,
  $quickViewProductId,
  $searchQuery,
  $theme,
  applyTheme,
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
} from '../../src/stores/ui';

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

// Mock window.matchMedia
Object.defineProperty(global, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    documentElement: {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    },
  },
});

describe('UI Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    $isMobileMenuOpen.set(false);
    $isCartDrawerOpen.set(false);
    $quickViewProductId.set(null);
    $isSearchOpen.set(false);
    $searchQuery.set('');
    vi.clearAllMocks();
  });

  describe('Mobile Menu', () => {
    it('should start closed', () => {
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
  });

  describe('Cart Drawer', () => {
    it('should start closed', () => {
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

  describe('Quick View', () => {
    it('should start with null product id', () => {
      expect($quickViewProductId.get()).toBeNull();
    });

    it('should open quick view with product id', () => {
      openQuickView('prod-123');
      expect($quickViewProductId.get()).toBe('prod-123');
    });

    it('should close quick view', () => {
      openQuickView('prod-123');
      closeQuickView();
      expect($quickViewProductId.get()).toBeNull();
    });
  });

  describe('Search', () => {
    it('should start closed with empty query', () => {
      expect($isSearchOpen.get()).toBe(false);
      expect($searchQuery.get()).toBe('');
    });

    it('should open search', () => {
      openSearch();
      expect($isSearchOpen.get()).toBe(true);
    });

    it('should close search and clear query', () => {
      openSearch();
      setSearchQuery('test query');
      closeSearch();

      expect($isSearchOpen.get()).toBe(false);
      expect($searchQuery.get()).toBe('');
    });

    it('should set search query', () => {
      setSearchQuery('test query');
      expect($searchQuery.get()).toBe('test query');
    });
  });

  describe('Theme', () => {
    it('should apply dark theme', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should apply light theme', () => {
      applyTheme('light');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should apply system theme based on preference', () => {
      applyTheme('system');
      // Since we mocked matchMedia to return true for dark preference
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should set and apply theme', () => {
      setTheme('dark');
      expect($theme.get()).toBe('dark');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });
  });
});
