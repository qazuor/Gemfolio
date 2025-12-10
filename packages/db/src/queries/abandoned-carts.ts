import { and, desc, eq, gte, isNull, lt, lte, or, sql } from 'drizzle-orm';

import type { Database } from '../client';
import {
  type AbandonedCart,
  type AbandonedCartStatus,
  abandonedCarts,
  type NewAbandonedCart,
} from '../schema/abandoned-carts';

// ============================================
// TYPES
// ============================================

export type AbandonedCartWithDetails = AbandonedCart & {
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  cart?: {
    id: string;
    updatedAt: Date;
  } | null;
};

export type AbandonedCartFilters = {
  status?: AbandonedCartStatus;
  isRecovered?: boolean;
  minTotal?: number;
  maxTotal?: number;
  startDate?: Date;
  endDate?: Date;
  hasEmail?: boolean;
};

export type AbandonedCartStats = {
  totalAbandoned: number;
  totalRecovered: number;
  recoveryRate: number;
  totalLostRevenue: number;
  totalRecoveredRevenue: number;
  pendingRecovery: number;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get abandoned carts with filters
 */
export async function getAbandonedCarts(
  db: Database,
  filters: AbandonedCartFilters = {},
  options: { limit?: number; offset?: number } = {}
): Promise<{ items: AbandonedCartWithDetails[]; total: number }> {
  const { limit = 20, offset = 0 } = options;

  const conditions = [];

  if (filters.status) {
    conditions.push(eq(abandonedCarts.status, filters.status));
  }
  if (filters.isRecovered !== undefined) {
    conditions.push(eq(abandonedCarts.isRecovered, filters.isRecovered));
  }
  if (filters.minTotal !== undefined) {
    conditions.push(gte(abandonedCarts.cartTotal, String(filters.minTotal)));
  }
  if (filters.maxTotal !== undefined) {
    conditions.push(lte(abandonedCarts.cartTotal, String(filters.maxTotal)));
  }
  if (filters.startDate) {
    conditions.push(gte(abandonedCarts.abandonedAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(abandonedCarts.abandonedAt, filters.endDate));
  }
  if (filters.hasEmail) {
    conditions.push(
      or(
        sql`${abandonedCarts.customerEmail} IS NOT NULL`,
        sql`${abandonedCarts.userId} IS NOT NULL`
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db.query.abandonedCarts.findMany({
      where: whereClause,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        cart: {
          columns: {
            id: true,
            updatedAt: true,
          },
        },
      },
      orderBy: [desc(abandonedCarts.abandonedAt)],
      limit,
      offset,
    }),
    db.select({ count: sql<number>`count(*)` }).from(abandonedCarts).where(whereClause),
  ]);

  return {
    items: items as AbandonedCartWithDetails[],
    total: Number(countResult[0]?.count ?? 0),
  };
}

/**
 * Get abandoned cart by ID
 */
export async function getAbandonedCartById(
  db: Database,
  id: string
): Promise<AbandonedCartWithDetails | null> {
  const result = await db.query.abandonedCarts.findFirst({
    where: eq(abandonedCarts.id, id),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      cart: {
        columns: {
          id: true,
          updatedAt: true,
        },
      },
    },
  });

  return (result as AbandonedCartWithDetails) ?? null;
}

/**
 * Get abandoned cart by cart ID
 */
export async function getAbandonedCartByCartId(
  db: Database,
  cartId: string
): Promise<AbandonedCart | null> {
  const result = await db.query.abandonedCarts.findFirst({
    where: eq(abandonedCarts.cartId, cartId),
    orderBy: [desc(abandonedCarts.createdAt)],
  });

  return result ?? null;
}

/**
 * Create an abandoned cart record
 */
export async function createAbandonedCart(
  db: Database,
  data: NewAbandonedCart
): Promise<AbandonedCart> {
  const result = await db.insert(abandonedCarts).values(data).returning();

  if (!result[0]) {
    throw new Error('Failed to create abandoned cart');
  }

  return result[0];
}

/**
 * Update an abandoned cart
 */
export async function updateAbandonedCart(
  db: Database,
  id: string,
  data: Partial<NewAbandonedCart>
): Promise<AbandonedCart | null> {
  const result = await db
    .update(abandonedCarts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(abandonedCarts.id, id))
    .returning();

  return result[0] ?? null;
}

/**
 * Mark abandoned cart as recovered
 */
export async function markAsRecovered(
  db: Database,
  id: string,
  orderId: string
): Promise<AbandonedCart | null> {
  const result = await db
    .update(abandonedCarts)
    .set({
      isRecovered: true,
      recoveredAt: new Date(),
      recoveredOrderId: orderId,
      status: 'recovered',
      updatedAt: new Date(),
    })
    .where(eq(abandonedCarts.id, id))
    .returning();

  return result[0] ?? null;
}

/**
 * Mark recovery email as sent
 */
export async function markRecoveryEmailSent(
  db: Database,
  id: string
): Promise<AbandonedCart | null> {
  const existing = await getAbandonedCartById(db, id);

  const isFollowUp = existing?.recoveryEmailSentAt !== null;

  const result = await db
    .update(abandonedCarts)
    .set({
      status: isFollowUp ? 'follow_up_sent' : 'email_sent',
      ...(isFollowUp ? { followUpEmailSentAt: new Date() } : { recoveryEmailSentAt: new Date() }),
      recoveryAttempts: sql`${abandonedCarts.recoveryAttempts} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(abandonedCarts.id, id))
    .returning();

  return result[0] ?? null;
}

/**
 * Track email opened
 */
export async function trackEmailOpened(db: Database, id: string): Promise<AbandonedCart | null> {
  const result = await db
    .update(abandonedCarts)
    .set({
      emailOpenedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(abandonedCarts.id, id), isNull(abandonedCarts.emailOpenedAt)))
    .returning();

  return result[0] ?? null;
}

/**
 * Track email clicked
 */
export async function trackEmailClicked(db: Database, id: string): Promise<AbandonedCart | null> {
  const result = await db
    .update(abandonedCarts)
    .set({
      emailClickedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(abandonedCarts.id, id), isNull(abandonedCarts.emailClickedAt)))
    .returning();

  return result[0] ?? null;
}

/**
 * Get carts ready for recovery email (abandoned > 1 hour, < 24 hours, not yet emailed)
 */
export async function getCartsForRecoveryEmail(
  db: Database,
  options: { limit?: number } = {}
): Promise<AbandonedCartWithDetails[]> {
  const { limit = 50 } = options;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await db.query.abandonedCarts.findMany({
    where: and(
      eq(abandonedCarts.status, 'pending'),
      eq(abandonedCarts.isRecovered, false),
      lte(abandonedCarts.abandonedAt, oneHourAgo),
      gte(abandonedCarts.abandonedAt, oneDayAgo),
      or(
        sql`${abandonedCarts.customerEmail} IS NOT NULL`,
        sql`${abandonedCarts.userId} IS NOT NULL`
      )
    ),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(abandonedCarts.cartTotal)], // Prioritize higher value carts
    limit,
  });

  return result as AbandonedCartWithDetails[];
}

/**
 * Get carts for follow-up email (first email sent > 24 hours, < 72 hours)
 */
export async function getCartsForFollowUpEmail(
  db: Database,
  options: { limit?: number } = {}
): Promise<AbandonedCartWithDetails[]> {
  const { limit = 50 } = options;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

  const result = await db.query.abandonedCarts.findMany({
    where: and(
      eq(abandonedCarts.status, 'email_sent'),
      eq(abandonedCarts.isRecovered, false),
      lte(abandonedCarts.recoveryEmailSentAt, oneDayAgo),
      gte(abandonedCarts.recoveryEmailSentAt, threeDaysAgo),
      or(
        sql`${abandonedCarts.customerEmail} IS NOT NULL`,
        sql`${abandonedCarts.userId} IS NOT NULL`
      )
    ),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(abandonedCarts.cartTotal)],
    limit,
  });

  return result as AbandonedCartWithDetails[];
}

/**
 * Get abandoned cart statistics
 */
export async function getAbandonedCartStats(
  db: Database,
  options: { startDate?: Date; endDate?: Date } = {}
): Promise<AbandonedCartStats> {
  const conditions = [];

  if (options.startDate) {
    conditions.push(gte(abandonedCarts.abandonedAt, options.startDate));
  }
  if (options.endDate) {
    conditions.push(lte(abandonedCarts.abandonedAt, options.endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({
      totalAbandoned: sql<number>`count(*)`,
      totalRecovered: sql<number>`count(*) filter (where ${abandonedCarts.isRecovered} = true)`,
      totalLostRevenue: sql<string>`COALESCE(SUM(${abandonedCarts.cartTotal}::numeric) filter (where ${abandonedCarts.isRecovered} = false), 0)`,
      totalRecoveredRevenue: sql<string>`COALESCE(SUM(${abandonedCarts.cartTotal}::numeric) filter (where ${abandonedCarts.isRecovered} = true), 0)`,
    })
    .from(abandonedCarts)
    .where(whereClause);

  const [pendingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(abandonedCarts)
    .where(
      and(whereClause, eq(abandonedCarts.status, 'pending'), eq(abandonedCarts.isRecovered, false))
    );

  const totalAbandoned = Number(totalResult?.totalAbandoned ?? 0);
  const totalRecovered = Number(totalResult?.totalRecovered ?? 0);

  return {
    totalAbandoned,
    totalRecovered,
    recoveryRate: totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0,
    totalLostRevenue: Number(totalResult?.totalLostRevenue ?? 0),
    totalRecoveredRevenue: Number(totalResult?.totalRecoveredRevenue ?? 0),
    pendingRecovery: Number(pendingResult?.count ?? 0),
  };
}

/**
 * Expire old abandoned carts (> 30 days)
 */
export async function expireOldAbandonedCarts(db: Database): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await db
    .update(abandonedCarts)
    .set({
      status: 'expired',
      updatedAt: new Date(),
    })
    .where(
      and(
        lt(abandonedCarts.abandonedAt, thirtyDaysAgo),
        eq(abandonedCarts.isRecovered, false),
        sql`${abandonedCarts.status} NOT IN ('expired', 'unsubscribed')`
      )
    )
    .returning();

  return result.length;
}

/**
 * Mark customer as unsubscribed from recovery emails
 */
export async function unsubscribeFromRecovery(db: Database, email: string): Promise<number> {
  const result = await db
    .update(abandonedCarts)
    .set({
      status: 'unsubscribed',
      updatedAt: new Date(),
    })
    .where(and(eq(abandonedCarts.customerEmail, email), eq(abandonedCarts.isRecovered, false)))
    .returning();

  return result.length;
}

/**
 * Delete abandoned cart record
 */
export async function deleteAbandonedCart(db: Database, id: string): Promise<boolean> {
  const result = await db.delete(abandonedCarts).where(eq(abandonedCarts.id, id)).returning();
  return result.length > 0;
}
