import { useQuery } from '@tanstack/react-query';

const API_BASE = '/api';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string | null;
  } | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    total: number;
  }>;
  timeline: Array<{
    status: string;
    date: string;
    note: string | null;
  }>;
}

// Fetch functions
async function fetchCustomerOrders(): Promise<OrderSummary[]> {
  const response = await fetch(`${API_BASE}/customer/orders`);
  if (!response.ok) {
    throw new Error('Error al cargar los pedidos');
  }
  const result = await response.json();
  return result.data;
}

async function fetchCustomerOrder(orderId: string): Promise<OrderDetail> {
  const response = await fetch(`${API_BASE}/customer/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Error al cargar el pedido');
  }
  const result = await response.json();
  return result.data;
}

// Query para obtener lista de pedidos del cliente
export function useCustomerOrders() {
  return useQuery<OrderSummary[]>({
    queryKey: ['customer-orders'],
    queryFn: fetchCustomerOrders,
  });
}

// Query para obtener detalle de un pedido
export function useCustomerOrder(orderId: string) {
  return useQuery<OrderDetail>({
    queryKey: ['customer-order', orderId],
    queryFn: () => fetchCustomerOrder(orderId),
    enabled: !!orderId,
  });
}
