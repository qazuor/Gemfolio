const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: string | null;
  price: string;
  comparePrice: string | null;
  cost: string | null;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  status: 'draft' | 'active' | 'archived';
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  images?: ProductImage[];
  tags?: Tag[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  order: number;
  status: 'active' | 'inactive';
  productCount?: number;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tag?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

// API Functions
export async function getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();

  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters?.inStock !== undefined) params.set('inStock', String(filters.inStock));
  if (filters?.tag) params.set('tag', filters.tag);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortDirection) params.set('sortDirection', filters.sortDirection);

  const response = await fetch(`${API_BASE}/products?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar productos');
  }
  return response.json();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const response = await fetch(`${API_BASE}/products/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Error al cargar producto');
  }
  const result = await response.json();
  return result.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) {
    throw new Error('Error al cargar categorías');
  }
  const result = await response.json();
  return result.data;
}

export async function getCategoryBySlug(
  slug: string
): Promise<{ category: Category; products: PaginatedResponse<Product> } | null> {
  const response = await fetch(`${API_BASE}/categories/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Error al cargar categoría');
  }
  const result = await response.json();
  return result.data;
}

export async function searchProducts(query: string, limit = 10): Promise<Product[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await fetch(`${API_BASE}/search?${params}`);
  if (!response.ok) {
    throw new Error('Error en búsqueda');
  }
  const result = await response.json();
  return result.data;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const response = await getProducts({
    tag: 'destacado',
    status: 'active',
    limit,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  return response.data;
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  const response = await getProducts({
    tag: 'nuevo',
    status: 'active',
    limit,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  return response.data;
}

export async function getOfferProducts(limit = 8): Promise<Product[]> {
  const response = await getProducts({
    tag: 'oferta',
    status: 'active',
    limit,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  return response.data;
}
