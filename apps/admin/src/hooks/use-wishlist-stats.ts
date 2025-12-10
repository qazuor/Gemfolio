import { useQuery } from '@tanstack/react-query';

const API_BASE = '/api';

export interface WishlistedProduct {
  productId: string;
  count: number;
  productName: string;
  productSlug: string;
  productPrice: string;
  productImage: string | null;
}

export interface WishlistStats {
  totalWishlisted: number;
  uniqueUsers: number;
  uniqueProducts: number;
  mostWishlisted: WishlistedProduct[];
}

async function fetchWishlistStats(): Promise<WishlistStats> {
  const response = await fetch(`${API_BASE}/admin/dashboard/wishlist-stats`);
  if (!response.ok) {
    throw new Error('Error al cargar estadísticas de wishlist');
  }
  const result = await response.json();
  return result.data;
}

export function useWishlistStats() {
  return useQuery({
    queryKey: ['wishlist-stats'],
    queryFn: fetchWishlistStats,
  });
}
