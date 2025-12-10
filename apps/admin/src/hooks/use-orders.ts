import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface AddressType {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderItemSnapshot {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  price: string;
  image?: string;
  attributes?: Record<string, string>;
}

interface OrderItem {
  id: string;
  snapshot: OrderItemSnapshot;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  shippingAddress: AddressType;
  billingAddress: AddressType | null;
  subtotal: string;
  discount: string;
  shippingCost: string;
  tax: string;
  total: string;
  couponCode: string | null;
  couponDiscount: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistoryItem[];
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  changedBy: string | null;
  createdAt: string;
  changedByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  sortDirection?: 'asc' | 'desc';
}

// Fetch functions
async function fetchOrders(filters?: OrderFilters): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (filters?.sortDirection) params.set('sortDirection', filters.sortDirection);

  const response = await fetch(`${API_BASE}/admin/orders?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar pedidos');
  }
  return response.json();
}

async function fetchOrder(id: string): Promise<Order> {
  const response = await fetch(`${API_BASE}/admin/orders/${id}`);
  if (!response.ok) {
    throw new Error('Error al cargar pedido');
  }
  const result = await response.json();
  return result.data;
}

async function updateOrderStatus(data: {
  id: string;
  status: OrderStatus;
  note?: string;
}): Promise<Order> {
  const response = await fetch(`${API_BASE}/admin/orders/${data.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: data.status, note: data.note }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar estado');
  }
  const result = await response.json();
  return result.data;
}

async function updatePaymentStatus(data: {
  id: string;
  paymentStatus: PaymentStatus;
}): Promise<Order> {
  const response = await fetch(`${API_BASE}/admin/orders/${data.id}/payment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentStatus: data.paymentStatus }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar estado de pago');
  }
  const result = await response.json();
  return result.data;
}

async function addOrderNote(data: { id: string; note: string }): Promise<Order> {
  const response = await fetch(`${API_BASE}/admin/orders/${data.id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: data.note }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al agregar nota');
  }
  const result = await response.json();
  return result.data;
}

// Hooks
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetchOrders(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      toast.success('Estado actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      toast.success('Estado de pago actualizado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAddOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addOrderNote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      toast.success('Nota agregada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'En preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };
  return labels[status];
}

export function getStatusColor(
  status: OrderStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    confirmed: 'default',
    processing: 'default',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
    refunded: 'outline',
  };
  return colors[status];
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  };
  return labels[status];
}

export function getPaymentStatusColor(
  status: PaymentStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    paid: 'default',
    failed: 'destructive',
    refunded: 'outline',
  };
  return colors[status];
}

// ============================================
// REFUNDS TYPES AND HOOKS
// ============================================

type RefundStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
type RefundReason =
  | 'customer_request'
  | 'defective_product'
  | 'wrong_item'
  | 'not_as_described'
  | 'damaged_shipping'
  | 'other';

export interface Refund {
  id: string;
  orderId: string;
  amount: string;
  reason: RefundReason;
  reasonDetails: string | null;
  status: RefundStatus;
  items: Array<{ orderItemId: string; quantity: number }> | null;
  processedBy: string | null;
  processedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  processedByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface RefundsResponse {
  refunds: Refund[];
  refundedAmount: string;
  orderTotal: string;
  remainingToRefund: string;
}

interface CreateRefundData {
  amount: string;
  reason: RefundReason;
  reasonDetails?: string;
  items?: Array<{ orderItemId: string; quantity: number }>;
  adminNotes?: string;
}

// Fetch functions
async function fetchOrderRefunds(orderId: string): Promise<RefundsResponse> {
  const response = await fetch(`${API_BASE}/admin/orders/${orderId}/refunds`);
  if (!response.ok) {
    throw new Error('Error al cargar reembolsos');
  }
  const result = await response.json();
  return result.data;
}

async function createRefund(orderId: string, data: CreateRefundData): Promise<Refund> {
  const response = await fetch(`${API_BASE}/admin/orders/${orderId}/refunds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear reembolso');
  }
  const result = await response.json();
  return result.data;
}

async function updateRefundStatus(
  orderId: string,
  refundId: string,
  data: { status: RefundStatus; rejectionReason?: string }
): Promise<Refund> {
  const response = await fetch(`${API_BASE}/admin/orders/${orderId}/refunds/${refundId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar estado del reembolso');
  }
  const result = await response.json();
  return result.data;
}

// Hooks
export function useOrderRefunds(orderId: string) {
  return useQuery({
    queryKey: ['order-refunds', orderId],
    queryFn: () => fetchOrderRefunds(orderId),
    enabled: !!orderId,
  });
}

export function useCreateRefund(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRefundData) => createRefund(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-refunds', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success('Reembolso creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRefundStatus(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      refundId,
      status,
      rejectionReason,
    }: {
      refundId: string;
      status: RefundStatus;
      rejectionReason?: string;
    }) => updateRefundStatus(orderId, refundId, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-refunds', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Estado del reembolso actualizado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions for refunds
export function getRefundStatusLabel(status: RefundStatus): string {
  const labels: Record<RefundStatus, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    processing: 'Procesando',
    completed: 'Completado',
    rejected: 'Rechazado',
  };
  return labels[status];
}

export function getRefundStatusColor(
  status: RefundStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<RefundStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    approved: 'default',
    processing: 'default',
    completed: 'default',
    rejected: 'destructive',
  };
  return colors[status];
}

export function getRefundReasonLabel(reason: RefundReason): string {
  const labels: Record<RefundReason, string> = {
    customer_request: 'Solicitud del cliente',
    defective_product: 'Producto defectuoso',
    wrong_item: 'Artículo incorrecto',
    not_as_described: 'No como se describió',
    damaged_shipping: 'Dañado en envío',
    other: 'Otro',
  };
  return labels[reason];
}
