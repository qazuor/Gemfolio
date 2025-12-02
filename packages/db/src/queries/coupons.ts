import { and, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';

import type { Database } from '../client';
import { type Coupon, coupons, type NewCoupon } from '../schema/coupons';

// ============================================
// TYPES
// ============================================
export type CouponFilters = {
  isActive?: boolean;
  type?: Coupon['type'];
  search?: string;
  validNow?: boolean;
};

export type CouponPaginationOptions = {
  page?: number;
  limit?: number;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get coupons with filters and pagination
 */
export async function getCoupons(
  db: Database,
  filters: CouponFilters = {},
  pagination: CouponPaginationOptions = {},
  orderDirection: 'asc' | 'desc' = 'desc'
) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.isActive !== undefined) {
    conditions.push(eq(coupons.isActive, filters.isActive));
  }

  if (filters.type) {
    conditions.push(eq(coupons.type, filters.type));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(coupons.code, `%${filters.search}%`),
        ilike(coupons.description, `%${filters.search}%`)
      )
    );
  }

  if (filters.validNow) {
    const now = new Date();
    conditions.push(eq(coupons.isActive, true));
    conditions.push(or(sql`${coupons.validFrom} IS NULL`, lte(coupons.validFrom, now)));
    conditions.push(or(sql`${coupons.validUntil} IS NULL`, gte(coupons.validUntil, now)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const couponsList = await db
    .select()
    .from(coupons)
    .where(whereClause)
    .orderBy(orderDirection === 'desc' ? desc(coupons.createdAt) : coupons.createdAt)
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(coupons)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  return {
    items: couponsList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get coupon by ID
 */
export async function getCouponById(db: Database, id: string): Promise<Coupon | null> {
  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return coupon ?? null;
}

/**
 * Get coupon by code
 */
export async function getCouponByCode(db: Database, code: string): Promise<Coupon | null> {
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);
  return coupon ?? null;
}

/**
 * Validate coupon for use
 */
export async function validateCoupon(
  db: Database,
  code: string,
  cartTotal: number
): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const coupon = await getCouponByCode(db, code);

  if (!coupon) {
    return { valid: false, error: 'Cupón no encontrado' };
  }

  if (!coupon.isActive) {
    return { valid: false, error: 'Cupón inactivo' };
  }

  const now = new Date();

  if (coupon.validFrom && coupon.validFrom > now) {
    return { valid: false, error: 'Cupón aún no es válido' };
  }

  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, error: 'Cupón expirado' };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: 'Cupón agotado' };
  }

  if (coupon.minimumPurchase && cartTotal < Number.parseFloat(coupon.minimumPurchase)) {
    return {
      valid: false,
      error: `Compra mínima requerida: $${coupon.minimumPurchase}`,
    };
  }

  return { valid: true, coupon };
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(coupon: Coupon, cartTotal: number): number {
  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (cartTotal * Number.parseFloat(coupon.value)) / 100;
    // Apply maximum discount if set
    if (coupon.maximumDiscount) {
      discount = Math.min(discount, Number.parseFloat(coupon.maximumDiscount));
    }
  } else if (coupon.type === 'fixed') {
    discount = Number.parseFloat(coupon.value);
    // Don't exceed cart total
    discount = Math.min(discount, cartTotal);
  }
  // For free_shipping, discount is handled separately

  return Math.round(discount * 100) / 100;
}

/**
 * Create a new coupon
 */
export async function createCoupon(db: Database, data: NewCoupon): Promise<Coupon> {
  // Ensure code is uppercase
  const couponData = {
    ...data,
    code: data.code.toUpperCase(),
  };

  const [coupon] = await db.insert(coupons).values(couponData).returning();

  if (!coupon) {
    throw new Error('Failed to create coupon');
  }

  return coupon;
}

/**
 * Update a coupon
 */
export async function updateCoupon(
  db: Database,
  id: string,
  data: Partial<NewCoupon>
): Promise<Coupon | null> {
  const updateData = { ...data };

  // Ensure code is uppercase if provided
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
  }

  const [coupon] = await db.update(coupons).set(updateData).where(eq(coupons.id, id)).returning();

  return coupon ?? null;
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(db: Database, id: string): Promise<boolean> {
  const result = await db.delete(coupons).where(eq(coupons.id, id)).returning();
  return result.length > 0;
}

/**
 * Increment coupon usage count
 */
export async function incrementCouponUsage(db: Database, id: string): Promise<void> {
  await db
    .update(coupons)
    .set({
      usageCount: sql`${coupons.usageCount} + 1`,
    })
    .where(eq(coupons.id, id));
}

/**
 * Toggle coupon active status
 */
export async function toggleCouponStatus(db: Database, id: string): Promise<Coupon | null> {
  const coupon = await getCouponById(db, id);
  if (!coupon) return null;

  const [updated] = await db
    .update(coupons)
    .set({ isActive: !coupon.isActive })
    .where(eq(coupons.id, id))
    .returning();

  return updated ?? null;
}
