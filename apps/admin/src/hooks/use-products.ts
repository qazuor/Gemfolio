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

async function duplicateProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/admin/products/${id}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al duplicar producto');
  }
  const result = await response.json();
  return result.data;
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Producto duplicado: ${data.name}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// =====================
// PRODUCT IMAGES
// =====================

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  isPrimary: boolean;
}

interface AddImagesData {
  productId: string;
  images: Array<{
    url: string;
    alt?: string;
    order?: number;
    isPrimary?: boolean;
  }>;
}

async function addProductImages({ productId, images }: AddImagesData): Promise<ProductImage[]> {
  const response = await fetch(`${API_BASE}/admin/products/${productId}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al agregar imagenes');
  }
  const result = await response.json();
  return result.data;
}

async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar imagen');
  }
}

async function setPrimaryImage(productId: string, imageId: string): Promise<ProductImage> {
  const response = await fetch(
    `${API_BASE}/admin/products/${productId}/images/${imageId}/primary`,
    {
      method: 'PATCH',
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al establecer imagen principal');
  }
  const result = await response.json();
  return result.data;
}

async function reorderImages(productId: string, imageIds: string[]): Promise<ProductImage[]> {
  const response = await fetch(`${API_BASE}/admin/products/${productId}/images/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageIds }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al reordenar imagenes');
  }
  const result = await response.json();
  return result.data;
}

export function useAddProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductImages,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      toast.success('Imagenes agregadas correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      deleteProductImage(productId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      toast.success('Imagen eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSetPrimaryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      setPrimaryImage(productId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      toast.success('Imagen principal actualizada');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useReorderImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageIds }: { productId: string; imageIds: string[] }) =>
      reorderImages(productId, imageIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// =====================
// PRODUCT VARIANTS
// =====================

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: string;
  comparePrice: string | null;
  stock: number;
  lowStockThreshold: number;
  attributes: Record<string, string>;
  image: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateVariantData {
  name: string;
  sku: string;
  price: string;
  comparePrice?: string;
  stock?: number;
  lowStockThreshold?: number;
  attributes?: Record<string, string>;
  image?: string;
  isDefault?: boolean;
}

interface UpdateVariantData {
  name?: string;
  sku?: string;
  price?: string;
  comparePrice?: string | null;
  stock?: number;
  lowStockThreshold?: number;
  attributes?: Record<string, string>;
  image?: string | null;
  isDefault?: boolean;
}

async function addProductVariants(
  productId: string,
  variants: CreateVariantData[]
): Promise<ProductVariant[]> {
  const response = await fetch(`${API_BASE}/admin/products/${productId}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variants }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al agregar variantes');
  }
  const result = await response.json();
  return result.data;
}

async function updateVariant(
  productId: string,
  variantId: string,
  data: UpdateVariantData
): Promise<ProductVariant> {
  const response = await fetch(`${API_BASE}/admin/products/${productId}/variants/${variantId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar variante');
  }
  const result = await response.json();
  return result.data;
}

async function deleteVariant(productId: string, variantId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/products/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar variante');
  }
}

async function setDefaultVariant(productId: string, variantId: string): Promise<ProductVariant> {
  const response = await fetch(
    `${API_BASE}/admin/products/${productId}/variants/${variantId}/default`,
    { method: 'PATCH' }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al establecer variante por defecto');
  }
  const result = await response.json();
  return result.data;
}

async function enableVariants(productId: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/admin/products/${productId}/variants/enable`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al activar variantes');
  }
  const result = await response.json();
  return result.data;
}

async function disableVariants(productId: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/admin/products/${productId}/variants/disable`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al desactivar variantes');
  }
  const result = await response.json();
  return result.data;
}

export function useAddProductVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variants }: { productId: string; variants: CreateVariantData[] }) =>
      addProductVariants(productId, variants),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      toast.success('Variantes agregadas correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: UpdateVariantData;
    }) => updateVariant(productId, variantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      toast.success('Variante actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      deleteVariant(productId, variantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      toast.success('Variante eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSetDefaultVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      setDefaultVariant(productId, variantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      toast.success('Variante por defecto actualizada');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useEnableVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => enableVariants(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('Variantes activadas correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDisableVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => disableVariants(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('Variantes desactivadas correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
