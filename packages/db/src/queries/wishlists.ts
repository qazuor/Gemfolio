import { and, desc, eq, sql } from 'drizzle-orm';

import type { Database } from '../client';
import { type NewWishlist, type Wishlist, wishlists } from '../schema/wishlists';

// ============================================
// TYPES
// ============================================

export type WishlistWithProduct = Wishlist & {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    comparePrice: string | null;
    image: string | null;
    status: string;
    stock: number;
  };
};

// Internal type for DB query results before transformation
type WishlistWithProductImages = Wishlist & {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    comparePrice: string | null;
    status: string;
    stock: number;
    images: Array<{ url: string; isPrimary: boolean }>;
  };
};

// Helper to extract primary image from product images
function extractPrimaryImage(images: Array<{ url: string; isPrimary: boolean }>): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.isPrimary);
  return primary?.url ?? images[0]?.url ?? null;
}

// ============================================
// QUERIES
// ============================================

/**
 * Get user's wishlist with products
 */
export async function getUserWishlist(
  db: Database,
  userId: string
): Promise<WishlistWithProduct[]> {
  const result = await db.query.wishlists.findMany({
    where: eq(wishlists.userId, userId),
    with: {
      product: {
        columns: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          status: true,
          stock: true,
        },
        with: {
          images: {
            columns: {
              url: true,
              isPrimary: true,
            },
            orderBy: (images, { asc }) => [asc(images.order)],
          },
        },
      },
    },
    orderBy: [desc(wishlists.createdAt)],
  });

  return (result as WishlistWithProductImages[]).map((item) => ({
    ...item,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      comparePrice: item.product.comparePrice,
      status: item.product.status,
      stock: item.product.stock,
      image: extractPrimaryImage(item.product.images),
    },
  }));
}

/**
 * Check if product is in user's wishlist
 */
export async function isInWishlist(
  db: Database,
  userId: string,
  productId: string
): Promise<boolean> {
  const result = await db.query.wishlists.findFirst({
    where: and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)),
  });

  return !!result;
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(db: Database, data: NewWishlist): Promise<Wishlist> {
  const result = await db
    .insert(wishlists)
    .values(data)
    .onConflictDoNothing({
      target: [wishlists.userId, wishlists.productId],
    })
    .returning();

  // If conflict, fetch existing
  if (!result[0]) {
    const existing = await db.query.wishlists.findFirst({
      where: and(eq(wishlists.userId, data.userId), eq(wishlists.productId, data.productId)),
    });
    return existing!;
  }

  return result[0];
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(
  db: Database,
  userId: string,
  productId: string
): Promise<boolean> {
  const result = await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
    .returning();

  return result.length > 0;
}

/**
 * Toggle product in wishlist (add if not present, remove if present)
 */
export async function toggleWishlist(
  db: Database,
  userId: string,
  productId: string
): Promise<{ added: boolean; wishlist?: Wishlist }> {
  const existing = await db.query.wishlists.findFirst({
    where: and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)),
  });

  if (existing) {
    await db.delete(wishlists).where(eq(wishlists.id, existing.id));
    return { added: false };
  }

  const result = await db.insert(wishlists).values({ userId, productId }).returning();

  return { added: true, wishlist: result[0] };
}

/**
 * Clear user's entire wishlist
 */
export async function clearWishlist(db: Database, userId: string): Promise<number> {
  const result = await db.delete(wishlists).where(eq(wishlists.userId, userId)).returning();

  return result.length;
}

/**
 * Get wishlist count for a user
 */
export async function getWishlistCount(db: Database, userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(wishlists)
    .where(eq(wishlists.userId, userId));

  return Number(result[0]?.count ?? 0);
}

/**
 * Get wishlist IDs for a user (for quick checks)
 */
export async function getWishlistProductIds(db: Database, userId: string): Promise<string[]> {
  const result = await db
    .select({ productId: wishlists.productId })
    .from(wishlists)
    .where(eq(wishlists.userId, userId));

  return result.map((r) => r.productId);
}

/**
 * Get product wishlist count (how many users have this product)
 */
export async function getProductWishlistCount(db: Database, productId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(wishlists)
    .where(eq(wishlists.productId, productId));

  return Number(result[0]?.count ?? 0);
}

/**
 * Get most wishlisted products
 */
export async function getMostWishlistedProducts(
  db: Database,
  limit = 10
): Promise<Array<{ productId: string; count: number }>> {
  const result = await db
    .select({
      productId: wishlists.productId,
      count: sql<number>`count(*)`,
    })
    .from(wishlists)
    .groupBy(wishlists.productId)
    .orderBy(sql`count(*) DESC`)
    .limit(limit);

  return result.map((r) => ({
    productId: r.productId,
    count: Number(r.count),
  }));
}
