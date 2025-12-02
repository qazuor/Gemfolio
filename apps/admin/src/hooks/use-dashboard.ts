import { useQuery } from '@tanstack/react-query';

const API_BASE = '/api';

// Types
export interface DashboardStats {
  today: {
    orders: number;
    revenue: string;
  };
  week: {
    orders: number;
    revenue: string;
  };
  month: {
    orders: number;
    revenue: string;
  };
  allTime: {
    orders: number;
    revenue: string;
  };
  pendingOrders: number;
  processingOrders: number;
  activeProducts: number;
  lowStockAlerts: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  itemCount: number;
}

export interface LowStockItem {
  id: string;
  sku: string | null;
  name: string;
  productName: string;
  stock: number;
  lowStockThreshold: number;
}

export interface SalesChartData {
  date: string;
  orders: number;
  revenue: string;
}

// Fetch functions
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/admin/dashboard/stats`);
  if (!response.ok) {
    throw new Error('Error al cargar estadísticas');
  }
  const result = await response.json();
  return result.data;
}

async function fetchRecentOrders(): Promise<RecentOrder[]> {
  const response = await fetch(`${API_BASE}/admin/dashboard/recent-orders`);
  if (!response.ok) {
    throw new Error('Error al cargar pedidos recientes');
  }
  const result = await response.json();
  return result.data;
}

async function fetchLowStockItems(): Promise<LowStockItem[]> {
  const response = await fetch(`${API_BASE}/admin/dashboard/low-stock`);
  if (!response.ok) {
    throw new Error('Error al cargar alertas de stock');
  }
  const result = await response.json();
  return result.data;
}

async function fetchSalesChart(): Promise<SalesChartData[]> {
  const response = await fetch(`${API_BASE}/admin/dashboard/sales-chart`);
  if (!response.ok) {
    throw new Error('Error al cargar datos de ventas');
  }
  const result = await response.json();
  return result.data;
}

// Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: fetchRecentOrders,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: fetchLowStockItems,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useSalesChart() {
  return useQuery({
    queryKey: ['dashboard', 'sales-chart'],
    queryFn: fetchSalesChart,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

// Utility functions
export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(num);
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
