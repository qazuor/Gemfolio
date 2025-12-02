import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
type MovementType = 'in' | 'out' | 'adjustment' | 'return';

export interface StockItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  currentStock: number;
  lowStockThreshold: number | null;
  isLowStock: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string | null;
  variantId: string | null;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  orderId: string | null;
  createdBy: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
  } | null;
  variant?: {
    id: string;
    name: string | null;
    sku: string | null;
  } | null;
  createdByUser?: {
    id: string;
    name: string | null;
  } | null;
}

interface InventoryResponse {
  data: StockItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface MovementsResponse {
  data: InventoryMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface LowStockResponse {
  data: {
    count: number;
    items: StockItem[];
  };
}

export interface InventoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  lowStockOnly?: boolean;
}

export interface MovementFilters {
  page?: number;
  limit?: number;
  productId?: string;
  variantId?: string;
  type?: MovementType;
}

interface AdjustStockData {
  productId?: string;
  variantId?: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}

// Fetch functions
async function fetchInventory(filters?: InventoryFilters): Promise<InventoryResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.lowStockOnly) params.set('lowStockOnly', 'true');

  const response = await fetch(`${API_BASE}/admin/inventory?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar inventario');
  }
  return response.json();
}

async function fetchLowStock(): Promise<LowStockResponse> {
  const response = await fetch(`${API_BASE}/admin/inventory/low-stock`);
  if (!response.ok) {
    throw new Error('Error al cargar alertas de stock');
  }
  return response.json();
}

async function fetchMovements(filters?: MovementFilters): Promise<MovementsResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.productId) params.set('productId', filters.productId);
  if (filters?.variantId) params.set('variantId', filters.variantId);
  if (filters?.type) params.set('type', filters.type);

  const response = await fetch(`${API_BASE}/admin/inventory/movements?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar movimientos');
  }
  return response.json();
}

async function fetchProductMovements(
  productId: string,
  variantId?: string
): Promise<{ data: InventoryMovement[] }> {
  const params = new URLSearchParams();
  if (variantId) params.set('variantId', variantId);

  const response = await fetch(`${API_BASE}/admin/inventory/product/${productId}?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar historial');
  }
  return response.json();
}

async function adjustStock(data: AdjustStockData): Promise<InventoryMovement> {
  const response = await fetch(`${API_BASE}/admin/inventory/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al ajustar stock');
  }
  const result = await response.json();
  return result.data;
}

// Hooks
export function useInventory(filters?: InventoryFilters) {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => fetchInventory(filters),
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: fetchLowStock,
  });
}

export function useInventoryMovements(filters?: MovementFilters) {
  return useQuery({
    queryKey: ['inventory', 'movements', filters],
    queryFn: () => fetchMovements(filters),
  });
}

export function useProductMovements(productId: string, variantId?: string) {
  return useQuery({
    queryKey: ['inventory', 'product-movements', productId, variantId],
    queryFn: () => fetchProductMovements(productId, variantId),
    enabled: !!productId,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Stock ajustado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions
export function getMovementTypeLabel(type: MovementType): string {
  const labels: Record<MovementType, string> = {
    in: 'Entrada',
    out: 'Salida',
    adjustment: 'Ajuste',
    return: 'Devolución',
  };
  return labels[type];
}

export function getMovementTypeColor(
  type: MovementType
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<MovementType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    in: 'default',
    out: 'destructive',
    adjustment: 'secondary',
    return: 'outline',
  };
  return colors[type];
}

export function getStockStatus(item: StockItem): {
  label: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (item.currentStock <= 0) {
    return { label: 'Agotado', color: 'destructive' };
  }
  if (item.isLowStock) {
    return { label: 'Stock bajo', color: 'secondary' };
  }
  return { label: 'En stock', color: 'default' };
}
