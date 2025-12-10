import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image?: string;
  stock: number;
  status: string;
}

// For anonymous users, we store locally
// For authenticated users, we sync with the server
export const $wishlist = persistentAtom<WishlistProduct[]>('gemfolio-wishlist', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Track if wishlist is synced with server
export const $wishlistSynced = persistentAtom<boolean>('gemfolio-wishlist-synced', false, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Computed values
export const $wishlistCount = computed($wishlist, (products) => products.length);

export const $wishlistProductIds = computed($wishlist, (products) => products.map((p) => p.id));

// Check if a specific product is in the wishlist
export function isInWishlist(productId: string): boolean {
  return $wishlist.get().some((p) => p.id === productId);
}

// Actions (local state management)
export function addToWishlistLocal(product: WishlistProduct): boolean {
  const products = $wishlist.get();

  // Check if already in wishlist
  if (products.some((p) => p.id === product.id)) {
    return false;
  }

  $wishlist.set([...products, product]);
  return true;
}

export function removeFromWishlistLocal(productId: string): void {
  const products = $wishlist.get();
  $wishlist.set(products.filter((p) => p.id !== productId));
}

export function toggleWishlistLocal(product: WishlistProduct): boolean {
  const products = $wishlist.get();
  const existingIndex = products.findIndex((p) => p.id === product.id);

  if (existingIndex > -1) {
    // Remove from wishlist
    $wishlist.set(products.filter((p) => p.id !== product.id));
    return false;
  }

  // Add to wishlist
  $wishlist.set([...products, product]);
  return true;
}

export function clearWishlistLocal(): void {
  $wishlist.set([]);
  $wishlistSynced.set(false);
}

// Sync with server (for authenticated users)
export function setWishlistFromServer(products: WishlistProduct[]): void {
  $wishlist.set(products);
  $wishlistSynced.set(true);
}

export function markWishlistUnsynced(): void {
  $wishlistSynced.set(false);
}

// Get products that are in stock
export function getAvailableWishlistProducts(): WishlistProduct[] {
  return $wishlist.get().filter((p) => p.status === 'active' && p.stock > 0);
}

// Get products that are out of stock
export function getOutOfStockWishlistProducts(): WishlistProduct[] {
  return $wishlist.get().filter((p) => p.status !== 'active' || p.stock <= 0);
}
