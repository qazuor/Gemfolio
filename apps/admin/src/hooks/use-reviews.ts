import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  content: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  moderatedBy: string | null;
  moderatedAt: string | null;
  moderationNote: string | null;
  helpfulCount: number;
  notHelpfulCount: number;
  adminResponse: string | null;
  adminResponseAt: string | null;
  adminRespondedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
}

interface ReviewsResponse {
  data: Review[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
  isVerifiedPurchase?: boolean;
}

interface ReviewStats {
  totalReviews: number;
  pendingReviews: number;
  averageRating: string;
  ratingDistribution: Record<number, number>;
}

// Fetch functions
async function fetchReviews(filters?: ReviewFilters): Promise<ReviewsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.productId) params.set('productId', filters.productId);
  if (filters?.userId) params.set('userId', filters.userId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.minRating) params.set('minRating', String(filters.minRating));
  if (filters?.maxRating) params.set('maxRating', String(filters.maxRating));
  if (filters?.isVerifiedPurchase !== undefined) {
    params.set('isVerifiedPurchase', String(filters.isVerifiedPurchase));
  }

  const response = await fetch(`${API_BASE}/admin/reviews?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar reseñas');
  }
  return response.json();
}

async function fetchPendingReviews(filters?: {
  page?: number;
  limit?: number;
}): Promise<{ data: Review[] }> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));

  const response = await fetch(`${API_BASE}/admin/reviews/pending?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar reseñas pendientes');
  }
  return response.json();
}

async function fetchReview(id: string): Promise<Review> {
  const response = await fetch(`${API_BASE}/admin/reviews/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar reseña');
  }
  const result = await response.json();
  return result.data;
}

async function fetchReviewStats(): Promise<ReviewStats> {
  const response = await fetch(`${API_BASE}/admin/dashboard/review-stats`);
  if (!response.ok) {
    throw new Error('Error al cargar estadísticas de reseñas');
  }
  const result = await response.json();
  return result.data;
}

async function moderateReview(data: {
  id: string;
  status: 'approved' | 'rejected';
  note?: string;
}): Promise<Review> {
  const response = await fetch(`${API_BASE}/admin/reviews/${data.id}/moderate`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: data.status, note: data.note }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al moderar reseña');
  }
  const result = await response.json();
  return result.data;
}

async function addAdminResponse(data: { id: string; response: string }): Promise<Review> {
  const response = await fetch(`${API_BASE}/admin/reviews/${data.id}/response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response: data.response }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al agregar respuesta');
  }
  const result = await response.json();
  return result.data;
}

async function deleteReview(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/reviews/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al eliminar reseña');
  }
}

// Hooks
export function useReviews(filters?: ReviewFilters) {
  return useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => fetchReviews(filters),
  });
}

export function usePendingReviews(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['reviews', 'pending', filters],
    queryFn: () => fetchPendingReviews(filters),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => fetchReview(id),
    enabled: !!id,
  });
}

export function useReviewStats() {
  return useQuery({
    queryKey: ['review-stats'],
    queryFn: fetchReviewStats,
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moderateReview,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', data.id] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success(data.status === 'approved' ? 'Reseña aprobada' : 'Reseña rechazada');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAddAdminResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAdminResponse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', data.id] });
      toast.success('Respuesta agregada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success('Reseña eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions
export function getReviewStatusLabel(status: ReviewStatus): string {
  const labels: Record<ReviewStatus, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
  };
  return labels[status];
}

export function getReviewStatusColor(
  status: ReviewStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<ReviewStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
  };
  return colors[status];
}

export function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente',
  };
  return labels[rating] || '';
}
