import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
interface BundleItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: string;
    images?: Array<{ url: string; isPrimary: boolean }>;
  };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: string;
  comparePrice: string | null;
  status: 'draft' | 'active' | 'archived';
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  items: BundleItem[];
}

interface BundleFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'active' | 'archived';
  validNow?: boolean;
}

interface CreateBundleData {
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  price: string;
  comparePrice?: string | null;
  status?: 'draft' | 'active' | 'archived';
  validFrom?: string | null;
  validUntil?: string | null;
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
}

interface UpdateBundleData extends Partial<CreateBundleData> {
  id: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Fetch functions
async function fetchBundles(filters: BundleFilters = {}): Promise<PaginatedResponse<Bundle>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.validNow !== undefined) params.set('validNow', String(filters.validNow));

  const response = await fetch(`${API_BASE}/admin/bundles?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Error al cargar bundles');
  }
  return response.json();
}

async function fetchBundle(id: string): Promise<Bundle> {
  const response = await fetch(`${API_BASE}/admin/bundles/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar bundle');
  }
  const result = await response.json();
  return result.data;
}

async function createBundle(data: CreateBundleData): Promise<Bundle> {
  const response = await fetch(`${API_BASE}/admin/bundles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear bundle');
  }
  const result = await response.json();
  return result.data;
}

async function updateBundle({ id, ...data }: UpdateBundleData): Promise<Bundle> {
  const response = await fetch(`${API_BASE}/admin/bundles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar bundle');
  }
  const result = await response.json();
  return result.data;
}

async function deleteBundle(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/bundles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar bundle');
  }
}

// Hooks
export function useBundles(filters: BundleFilters = {}) {
  return useQuery({
    queryKey: ['bundles', filters],
    queryFn: () => fetchBundles(filters),
  });
}

export function useBundle(id: string) {
  return useQuery({
    queryKey: ['bundle', id],
    queryFn: () => fetchBundle(id),
    enabled: !!id,
  });
}

export function useCreateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBundle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Bundle creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBundle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      queryClient.invalidateQueries({ queryKey: ['bundle', data.id] });
      toast.success('Bundle actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Bundle eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
