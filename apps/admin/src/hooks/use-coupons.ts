import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
type CouponType = 'percentage' | 'fixed' | 'free_shipping';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: string;
  minimumPurchase: string | null;
  maximumDiscount: string | null;
  usageLimit: number | null;
  usageCount: number;
  usagePerUser: number | null;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CouponsResponse {
  data: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CouponFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  type?: CouponType;
  sortDirection?: 'asc' | 'desc';
}

export interface CreateCouponData {
  code: string;
  description?: string;
  type: CouponType;
  value: string;
  minimumPurchase?: string | null;
  maximumDiscount?: string | null;
  usageLimit?: number | null;
  usagePerUser?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive?: boolean;
}

interface UpdateCouponData extends Partial<CreateCouponData> {
  id: string;
}

// Fetch functions
async function fetchCoupons(filters?: CouponFilters): Promise<CouponsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
  if (filters?.type) params.set('type', filters.type);
  if (filters?.sortDirection) params.set('sortDirection', filters.sortDirection);

  const response = await fetch(`${API_BASE}/admin/coupons?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar cupones');
  }
  return response.json();
}

async function fetchCoupon(id: string): Promise<Coupon> {
  const response = await fetch(`${API_BASE}/admin/coupons/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar cupón');
  }
  const result = await response.json();
  return result.data;
}

async function createCoupon(data: CreateCouponData): Promise<Coupon> {
  const response = await fetch(`${API_BASE}/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear cupón');
  }
  const result = await response.json();
  return result.data;
}

async function updateCoupon({ id, ...data }: UpdateCouponData): Promise<Coupon> {
  const response = await fetch(`${API_BASE}/admin/coupons/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar cupón');
  }
  const result = await response.json();
  return result.data;
}

async function deleteCoupon(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/coupons/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar cupón');
  }
}

async function toggleCouponStatus(id: string): Promise<Coupon> {
  const response = await fetch(`${API_BASE}/admin/coupons/${id}/toggle`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cambiar estado');
  }
  const result = await response.json();
  return result.data;
}

// Hooks
export function useCoupons(filters?: CouponFilters) {
  return useQuery({
    queryKey: ['coupons', filters],
    queryFn: () => fetchCoupons(filters),
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: () => fetchCoupon(id),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupón creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCoupon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon', data.id] });
      toast.success('Cupón actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupón eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleCouponStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCouponStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon', data.id] });
      toast.success(data.isActive ? 'Cupón activado' : 'Cupón desactivado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions
export function getCouponTypeLabel(type: CouponType): string {
  const labels: Record<CouponType, string> = {
    percentage: 'Porcentaje',
    fixed: 'Monto fijo',
    free_shipping: 'Envío gratis',
  };
  return labels[type];
}

export function formatCouponValue(coupon: Coupon): string {
  if (coupon.type === 'percentage') {
    return `${coupon.value}%`;
  }
  if (coupon.type === 'fixed') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(coupon.value));
  }
  return 'Envío gratis';
}

export function getCouponStatus(coupon: Coupon): {
  label: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (!coupon.isActive) {
    return { label: 'Inactivo', color: 'secondary' };
  }

  const now = new Date();

  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return { label: 'Programado', color: 'outline' };
  }

  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { label: 'Expirado', color: 'destructive' };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { label: 'Agotado', color: 'destructive' };
  }

  return { label: 'Activo', color: 'default' };
}

export function generateCouponCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
