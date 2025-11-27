import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';

import type { Database } from '../client';
import {
  type NewOrder,
  type Order,
  type OrderItemSnapshot,
  orderItems,
  orderStatusHistory,
  orders,
} from '../schema/orders';

// ============================================
// TYPES
// ============================================
export type OrderFilters = {
  userId?: string;
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  startDate?: Date;
  endDate?: Date;
  customerEmail?: string;
};

export type OrderWithItems = Order & {
  items: Array<{
    id: string;
    snapshot: OrderItemSnapshot;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
};

export type OrderPaginationOptions = {
  page?: number;
  limit?: number;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get orders with filters and pagination
 */
export async function getOrders(
  db: Database,
  filters: OrderFilters = {},
  pagination: OrderPaginationOptions = {},
  orderDirection: 'asc' | 'desc' = 'desc'
) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(orders.userId, filters.userId));
  }

  if (filters.status) {
    conditions.push(eq(orders.status, filters.status));
  }

  if (filters.paymentStatus) {
    conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
  }

  if (filters.startDate) {
    conditions.push(gte(orders.createdAt, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(orders.createdAt, filters.endDate));
  }

  if (filters.customerEmail) {
    conditions.push(eq(orders.customerEmail, filters.customerEmail));
  }

  const orderFn = orderDirection === 'asc' ? asc : desc;

  const result = await db
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderFn(orders.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    items: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get order by ID with all relations
 */
export async function getOrderById(db: Database, id: string): Promise<OrderWithItems | null> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: true,
      statusHistory: {
        orderBy: [desc(orderStatusHistory.createdAt)],
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    items: order.items.map((item) => ({
      id: item.id,
      snapshot: item.snapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
  };
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(
  db: Database,
  orderNumber: string
): Promise<OrderWithItems | null> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: {
      items: true,
      statusHistory: {
        orderBy: [desc(orderStatusHistory.createdAt)],
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    items: order.items.map((item) => ({
      id: item.id,
      snapshot: item.snapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
  };
}

/**
 * Get user's orders
 */
export async function getUserOrders(
  db: Database,
  userId: string,
  pagination: OrderPaginationOptions = {}
) {
  return getOrders(db, { userId }, pagination);
}

/**
 * Create a new order
 */
export async function createOrder(
  db: Database,
  orderData: NewOrder,
  items: Array<{
    snapshot: OrderItemSnapshot;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>
) {
  const result = await db.insert(orders).values(orderData).returning();
  const newOrder = result[0];

  if (!newOrder) {
    throw new Error('Failed to create order');
  }

  // Insert order items
  if (items.length > 0) {
    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId: newOrder.id,
        snapshot: item.snapshot,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }))
    );
  }

  // Add initial status history
  await db.insert(orderStatusHistory).values({
    orderId: newOrder.id,
    status: 'pending',
    note: 'Pedido creado',
  });

  return newOrder;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  db: Database,
  orderId: string,
  status: Order['status'],
  note?: string,
  changedBy?: string
) {
  const result = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  if (result[0]) {
    await db.insert(orderStatusHistory).values({
      orderId,
      status,
      note,
      changedBy,
    });
  }

  return result[0];
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  db: Database,
  orderId: string,
  paymentStatus: Order['paymentStatus']
) {
  const result = await db
    .update(orders)
    .set({ paymentStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  return result[0];
}

/**
 * Update order (general)
 */
export async function updateOrder(db: Database, id: string, data: Partial<NewOrder>) {
  const result = await db
    .update(orders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  return result[0];
}

/**
 * Add admin notes to order
 */
export async function addOrderAdminNotes(db: Database, orderId: string, adminNotes: string) {
  const result = await db
    .update(orders)
    .set({ adminNotes, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  return result[0];
}

/**
 * Get order status history
 */
export async function getOrderStatusHistory(db: Database, orderId: string) {
  return db.query.orderStatusHistory.findMany({
    where: eq(orderStatusHistory.orderId, orderId),
    with: {
      changedByUser: true,
    },
    orderBy: [desc(orderStatusHistory.createdAt)],
  });
}

/**
 * Get order statistics
 */
export async function getOrderStats(db: Database, startDate?: Date, endDate?: Date) {
  const conditions = [];

  if (startDate) {
    conditions.push(gte(orders.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(orders.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalOrders] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(whereClause);

  const [totalRevenue] = await db
    .select({ sum: sql<string>`COALESCE(SUM(total::numeric), 0)` })
    .from(orders)
    .where(and(whereClause, eq(orders.paymentStatus, 'paid')));

  const [pendingOrders] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(whereClause, eq(orders.status, 'pending')));

  const [processingOrders] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(whereClause, eq(orders.status, 'processing')));

  return {
    totalOrders: Number(totalOrders?.count ?? 0),
    totalRevenue: totalRevenue?.sum ?? '0',
    pendingOrders: Number(pendingOrders?.count ?? 0),
    processingOrders: Number(processingOrders?.count ?? 0),
  };
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  db: Database,
  orderId: string,
  reason?: string,
  changedBy?: string
) {
  return updateOrderStatus(db, orderId, 'cancelled', reason ?? 'Pedido cancelado', changedBy);
}

/**
 * Search orders by order number or customer email
 */
export async function searchOrders(db: Database, query: string, limit = 10) {
  const result = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(
      sql`${orders.orderNumber} ILIKE ${`%${query}%`} OR ${orders.customerEmail} ILIKE ${`%${query}%`} OR ${orders.customerName} ILIKE ${`%${query}%`}`
    )
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  return result;
}
