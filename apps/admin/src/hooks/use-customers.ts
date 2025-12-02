import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
type UserRole = 'customer' | 'admin' | 'super_admin';

export interface Customer {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithStats extends Customer {
  orderCount: number;
  totalSpent: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
}

interface CustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CustomerOrdersResponse {
  data: CustomerOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

// Fetch functions
async function fetchCustomers(filters?: CustomerFilters): Promise<CustomersResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.role) params.set('role', filters.role);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortDirection) params.set('sortDirection', filters.sortDirection);

  const response = await fetch(`${API_BASE}/admin/users?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar clientes');
  }
  return response.json();
}

async function fetchCustomer(id: string): Promise<CustomerWithStats> {
  const response = await fetch(`${API_BASE}/admin/users/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar cliente');
  }
  const result = await response.json();
  return result.data;
}

async function fetchCustomerOrders(
  id: string,
  page = 1,
  limit = 10
): Promise<CustomerOrdersResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  const response = await fetch(`${API_BASE}/admin/users/${id}/orders?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar pedidos del cliente');
  }
  return response.json();
}

async function updateCustomerRole(data: { id: string; role: UserRole }): Promise<Customer> {
  const response = await fetch(`${API_BASE}/admin/users/${data.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: data.role }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar rol');
  }
  const result = await response.json();
  return result.data;
}

// Hooks
export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => fetchCustomers(filters),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomer(id),
    enabled: !!id,
  });
}

export function useCustomerOrders(id: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['customer-orders', id, page, limit],
    queryFn: () => fetchCustomerOrders(id, page, limit),
    enabled: !!id,
  });
}

export function useUpdateCustomerRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomerRole,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast.success('Rol actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    customer: 'Cliente',
    admin: 'Administrador',
    super_admin: 'Super Admin',
  };
  return labels[role];
}

export function getRoleColor(role: UserRole): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<UserRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    customer: 'secondary',
    admin: 'default',
    super_admin: 'destructive',
  };
  return colors[role];
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(num);
}
