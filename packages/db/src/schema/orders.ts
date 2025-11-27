import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { createId, generateOrderNumber } from '../utils';
import { users } from './users';

// Order status enum
export const orderStatusEnum = pgEnum('order_status', [
  'pending', // Pedido creado, esperando confirmación
  'confirmed', // Pedido confirmado
  'processing', // En preparación
  'shipped', // Enviado
  'delivered', // Entregado
  'cancelled', // Cancelado
  'refunded', // Reembolsado
]);

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', // Pendiente de pago
  'paid', // Pagado
  'failed', // Pago fallido
  'refunded', // Reembolsado
]);

// Address type for JSONB
export type AddressType = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

// Orders table
export const orders = pgTable(
  'orders',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    orderNumber: varchar('order_number', { length: 20 })
      .notNull()
      .unique()
      .$defaultFn(() => generateOrderNumber()),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    // Customer info (stored separately for guests and historical purposes)
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    customerName: varchar('customer_name', { length: 255 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 50 }),
    // Addresses
    shippingAddress: jsonb('shipping_address').$type<AddressType>().notNull(),
    billingAddress: jsonb('billing_address').$type<AddressType>(),
    // Pricing
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    discount: decimal('discount', { precision: 10, scale: 2 }).default('0').notNull(),
    shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0').notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).default('0').notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    // Coupon
    couponCode: varchar('coupon_code', { length: 50 }),
    couponDiscount: decimal('coupon_discount', { precision: 10, scale: 2 }),
    // Status
    status: orderStatusEnum('status').default('pending').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
    // Notes
    customerNotes: text('customer_notes'),
    adminNotes: text('admin_notes'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('orders_order_number_idx').on(table.orderNumber),
    index('orders_user_id_idx').on(table.userId),
    index('orders_status_idx').on(table.status),
    index('orders_created_at_idx').on(table.createdAt),
  ]
);

// Order item snapshot type
export type OrderItemSnapshot = {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  price: string;
  image?: string;
  attributes?: Record<string, string>;
};

// Order items table (with snapshot of product data)
export const orderItems = pgTable(
  'order_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    // Snapshot of product at time of order
    snapshot: jsonb('snapshot').$type<OrderItemSnapshot>().notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('order_items_order_id_idx').on(table.orderId)]
);

// Order status history table
export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: orderStatusEnum('status').notNull(),
    note: text('note'),
    changedBy: text('changed_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('order_status_history_order_id_idx').on(table.orderId)]
);

// Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  changedByUser: one(users, {
    fields: [orderStatusHistory.changedBy],
    references: [users.id],
  }),
}));

// Types
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;
