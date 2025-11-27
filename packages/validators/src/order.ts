import { z } from 'zod';

// Order status enum
export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// Payment status enum
export const paymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded']);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Dirección es requerida'),
  city: z.string().min(1, 'Ciudad es requerida'),
  state: z.string().min(1, 'Provincia es requerida'),
  postalCode: z.string().min(1, 'Código postal es requerido'),
  country: z.string().default('Argentina'),
});

export type Address = z.infer<typeof addressSchema>;

// Create order schema (from checkout)
export const createOrderSchema = z.object({
  // Customer info
  customerName: z.string().min(1, 'Nombre es requerido'),
  customerEmail: z.string().email('Email inválido'),
  customerPhone: z.string().min(1, 'Teléfono es requerido'),

  // Addresses
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsBilling: z.boolean().default(true),

  // Order details
  notes: z.string().max(1000).optional(),
  couponCode: z.string().optional(),

  // Cart reference (for creating from cart)
  cartId: z.string().optional(),
});

export type CreateOrder = z.infer<typeof createOrderSchema>;

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  note: z.string().max(500).optional(),
});

export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;

// Update payment status schema
export const updatePaymentStatusSchema = z.object({
  paymentStatus: paymentStatusSchema,
  paymentReference: z.string().optional(),
});

export type UpdatePaymentStatus = z.infer<typeof updatePaymentStatusSchema>;

// Add order note schema
export const addOrderNoteSchema = z.object({
  note: z.string().min(1, 'Nota es requerida').max(1000),
  isInternal: z.boolean().default(true),
});

export type AddOrderNote = z.infer<typeof addOrderNoteSchema>;

// Order filters for querying
export const orderFiltersSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  customerEmail: z.string().email().optional(),
  orderNumber: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
});

export type OrderFilters = z.infer<typeof orderFiltersSchema>;

// Order pagination
export const orderPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'total', 'orderNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type OrderPagination = z.infer<typeof orderPaginationSchema>;
