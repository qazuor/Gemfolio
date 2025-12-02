import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  order: number;
  status: 'active' | 'inactive';
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  children?: Category[];
}

interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  image?: string | null;
  parentId?: string | null;
  status?: 'active' | 'inactive';
  seoTitle?: string;
  seoDescription?: string;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

interface ReorderData {
  categories: Array<{ id: string; order: number; parentId?: string | null }>;
}

// Fetch functions
async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/admin/categories`);
  if (!response.ok) {
    throw new Error('Error al cargar categorías');
  }
  const result = await response.json();
  return result.data;
}

async function fetchCategory(id: string): Promise<Category> {
  const response = await fetch(`${API_BASE}/admin/categories/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar categoría');
  }
  const result = await response.json();
  return result.data;
}

async function createCategory(data: CreateCategoryData): Promise<Category> {
  const response = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear categoría');
  }
  const result = await response.json();
  return result.data;
}

async function updateCategory({ id, ...data }: UpdateCategoryData): Promise<Category> {
  const response = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar categoría');
  }
  const result = await response.json();
  return result.data;
}

async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar categoría');
  }
}

async function reorderCategories(data: ReorderData): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/categories/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al reordenar categorías');
  }
}

// Hooks
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', data.id] });
      toast.success('Categoría actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categorías reordenadas');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
