import type { ProductFilters, ProductPagination } from '@gemfolio/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type ProductQueryFilters = ProductFilters & Partial<ProductPagination>;

const API_BASE = '/api';

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string;
  comparePrice: string | null;
  cost: string | null;
  categoryId: string | null;
  status: 'draft' | 'active' | 'archived';
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  hasVariants: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images?: Array<{
    id: string;
    url: string;
    alt: string | null;
    order: number;
    isPrimary: boolean;
  }>;
  variants?: Array<{
    id: string;
    sku: string | null;
    name: string | null;
    price: string | null;
    stock: number;
  }>;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
  }>;
}

interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateProductData {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  categoryId?: string;
  status?: 'draft' | 'active' | 'archived';
  sku?: string;
  stock?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tagIds?: string[];
}

interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Fetch functions
async function fetchProducts(filters?: ProductQueryFilters): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.status) params.set('status', filters.status);
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

  const response = await fetch(`${API_BASE}/admin/products?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar productos');
  }
  return response.json();
}

async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/admin/products/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar producto');
  }
  const result = await response.json();
  return result.data;
}

async function createProduct(data: CreateProductData): Promise<Product> {
  const response = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear producto');
  }
  const result = await response.json();
  return result.data;
}

async function updateProduct({ id, ...data }: UpdateProductData): Promise<Product> {
  const response = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar producto');
  }
  const result = await response.json();
  return result.data;
}

async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar producto');
  }
}

// Hooks
export function useProducts(filters?: ProductQueryFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast.success('Producto actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
