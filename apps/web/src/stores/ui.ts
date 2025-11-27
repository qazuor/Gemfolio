import { persistentAtom } from '@nanostores/persistent';
import { atom } from 'nanostores';

// Theme
export type Theme = 'light' | 'dark' | 'system';

export const $theme = persistentAtom<Theme>('gemfolio-theme', 'system');

export function setTheme(theme: Theme) {
  $theme.set(theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Mobile menu
export const $isMobileMenuOpen = atom(false);

export function toggleMobileMenu() {
  $isMobileMenuOpen.set(!$isMobileMenuOpen.get());
}

export function closeMobileMenu() {
  $isMobileMenuOpen.set(false);
}

// Cart drawer
export const $isCartDrawerOpen = atom(false);

export function openCartDrawer() {
  $isCartDrawerOpen.set(true);
}

export function closeCartDrawer() {
  $isCartDrawerOpen.set(false);
}

export function toggleCartDrawer() {
  $isCartDrawerOpen.set(!$isCartDrawerOpen.get());
}

// Quick view modal
export const $quickViewProductId = atom<string | null>(null);

export function openQuickView(productId: string) {
  $quickViewProductId.set(productId);
}

export function closeQuickView() {
  $quickViewProductId.set(null);
}

// Search
export const $isSearchOpen = atom(false);
export const $searchQuery = atom('');

export function openSearch() {
  $isSearchOpen.set(true);
}

export function closeSearch() {
  $isSearchOpen.set(false);
  $searchQuery.set('');
}

export function setSearchQuery(query: string) {
  $searchQuery.set(query);
}
