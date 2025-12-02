import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
type PageStatus = 'draft' | 'published';

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  status: PageStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PagesResponse {
  data: Page[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PageFilters {
  page?: number;
  limit?: number;
  status?: PageStatus;
}

export interface PageFormData {
  slug: string;
  title: string;
  content?: string;
  status?: PageStatus;
  seoTitle?: string;
  seoDescription?: string;
}

// Fetch functions
async function fetchPages(filters?: PageFilters): Promise<PagesResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.status) params.set('status', filters.status);

  const response = await fetch(`${API_BASE}/admin/pages?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar páginas');
  }
  return response.json();
}

async function fetchPage(id: string): Promise<Page> {
  const response = await fetch(`${API_BASE}/admin/pages/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar página');
  }
  const result = await response.json();
  return result.data;
}

async function createPage(data: PageFormData): Promise<Page> {
  const response = await fetch(`${API_BASE}/admin/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear página');
  }
  const result = await response.json();
  return result.data;
}

async function updatePage(id: string, data: Partial<PageFormData>): Promise<Page> {
  const response = await fetch(`${API_BASE}/admin/pages/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar página');
  }
  const result = await response.json();
  return result.data;
}

async function deletePage(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/pages/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar página');
  }
}

// Hooks
export function usePages(filters?: PageFilters) {
  return useQuery({
    queryKey: ['pages', filters],
    queryFn: () => fetchPages(filters),
  });
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: () => fetchPage(id),
    enabled: !!id,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Página creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PageFormData> }) => updatePage(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', data.id] });
      toast.success('Página actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Página eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions
export function getStatusLabel(status: PageStatus): string {
  const labels: Record<PageStatus, string> = {
    draft: 'Borrador',
    published: 'Publicada',
  };
  return labels[status];
}

export function getStatusColor(status: PageStatus): 'default' | 'secondary' {
  const colors: Record<PageStatus, 'default' | 'secondary'> = {
    draft: 'secondary',
    published: 'default',
  };
  return colors[status];
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
