import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
export type AbandonedCartStatus =
  | 'pending'
  | 'email_sent'
  | 'follow_up_sent'
  | 'recovered'
  | 'expired'
  | 'unsubscribed';

export interface AbandonedCart {
  id: string;
  cartId: string;
  userId: string | null;
  customerEmail: string | null;
  cartTotal: string;
  cartItems: unknown;
  status: AbandonedCartStatus;
  isRecovered: boolean;
  recoveryAttempts: number;
  recoveryEmailSentAt: string | null;
  followUpEmailSentAt: string | null;
  emailOpenedAt: string | null;
  emailClickedAt: string | null;
  recoveredAt: string | null;
  recoveredOrderId: string | null;
  discountCode: string | null;
  discountPercent: number | null;
  abandonedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface AbandonedCartsResponse {
  data: AbandonedCart[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AbandonedCartFilters {
  page?: number;
  limit?: number;
  status?: AbandonedCartStatus;
  isRecovered?: boolean;
  minTotal?: number;
  maxTotal?: number;
  hasEmail?: boolean;
}

export interface AbandonedCartStats {
  totalAbandoned: number;
  totalRecovered: number;
  recoveryRate: number;
  totalLostRevenue: number;
  totalRecoveredRevenue: number;
  pendingRecovery: number;
}

// Fetch functions
async function fetchAbandonedCarts(
  filters?: AbandonedCartFilters
): Promise<AbandonedCartsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.status) params.set('status', filters.status);
  if (filters?.isRecovered !== undefined) params.set('isRecovered', String(filters.isRecovered));
  if (filters?.minTotal !== undefined) params.set('minTotal', String(filters.minTotal));
  if (filters?.maxTotal !== undefined) params.set('maxTotal', String(filters.maxTotal));
  if (filters?.hasEmail !== undefined) params.set('hasEmail', String(filters.hasEmail));

  const response = await fetch(`${API_BASE}/admin/abandoned-carts?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar carritos abandonados');
  }
  return response.json();
}

async function fetchAbandonedCart(id: string): Promise<AbandonedCart> {
  const response = await fetch(`${API_BASE}/admin/abandoned-carts/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar carrito abandonado');
  }
  const result = await response.json();
  return result.data;
}

async function fetchAbandonedCartStats(): Promise<AbandonedCartStats> {
  const response = await fetch(`${API_BASE}/admin/abandoned-carts/stats`);
  if (!response.ok) {
    throw new Error('Error al cargar estadísticas');
  }
  const result = await response.json();
  return result.data;
}

async function sendRecoveryEmail(id: string): Promise<AbandonedCart> {
  const response = await fetch(`${API_BASE}/admin/abandoned-carts/${id}/send-recovery`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al enviar email');
  }
  const result = await response.json();
  return result.data;
}

async function updateAbandonedCart(data: {
  id: string;
  status?: AbandonedCartStatus;
  discountCode?: string;
  discountPercent?: number;
}): Promise<AbandonedCart> {
  const { id, ...updateData } = data;
  const response = await fetch(`${API_BASE}/admin/abandoned-carts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al actualizar carrito');
  }
  const result = await response.json();
  return result.data;
}

async function deleteAbandonedCart(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/abandoned-carts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al eliminar carrito');
  }
}

// Hooks
export function useAbandonedCarts(filters?: AbandonedCartFilters) {
  return useQuery({
    queryKey: ['abandoned-carts', filters],
    queryFn: () => fetchAbandonedCarts(filters),
  });
}

export function useAbandonedCart(id: string) {
  return useQuery({
    queryKey: ['abandoned-cart', id],
    queryFn: () => fetchAbandonedCart(id),
    enabled: !!id,
  });
}

export function useAbandonedCartStats() {
  return useQuery({
    queryKey: ['abandoned-cart-stats'],
    queryFn: fetchAbandonedCartStats,
  });
}

export function useSendRecoveryEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendRecoveryEmail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
      queryClient.invalidateQueries({ queryKey: ['abandoned-cart', data.id] });
      queryClient.invalidateQueries({ queryKey: ['abandoned-cart-stats'] });
      toast.success('Email de recuperación enviado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAbandonedCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAbandonedCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
      queryClient.invalidateQueries({ queryKey: ['abandoned-cart', data.id] });
      toast.success('Carrito actualizado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAbandonedCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAbandonedCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
      queryClient.invalidateQueries({ queryKey: ['abandoned-cart-stats'] });
      toast.success('Registro eliminado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions
export function getStatusLabel(status: AbandonedCartStatus): string {
  const labels: Record<AbandonedCartStatus, string> = {
    pending: 'Pendiente',
    email_sent: 'Email enviado',
    follow_up_sent: 'Seguimiento enviado',
    recovered: 'Recuperado',
    expired: 'Expirado',
    unsubscribed: 'Dado de baja',
  };
  return labels[status];
}

export function getStatusColor(
  status: AbandonedCartStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<AbandonedCartStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    email_sent: 'outline',
    follow_up_sent: 'outline',
    recovered: 'default',
    expired: 'destructive',
    unsubscribed: 'destructive',
  };
  return colors[status];
}
