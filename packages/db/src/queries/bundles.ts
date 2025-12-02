import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';

import type { Database } from '../client';
import {
  type Bundle,
  bundleItems,
  bundles,
  type NewBundle,
  type NewBundleItem,
} from '../schema/bundles';
import { productImages, products, productVariants } from '../schema/products';

// ============================================
// TYPES
// ============================================
export type BundleFilters = {
  status?: 'draft' | 'active' | 'archived';
  search?: string;
  activeOnly?: boolean;
};

export type BundleOrderBy = 'name' | 'price' | 'createdAt' | 'updatedAt';
// Note: Use OrderDirection from products.ts to avoid duplicate export

export type BundlePaginationOptions = {
  page?: number;
  limit?: number;
};

export type BundleWithItems = Bundle & {
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: string;
      image: string | null;
    };
    variant: {
      id: string;
      name: string;
      price: string;
    } | null;
  }>;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get bundles with filters, pagination, and sorting
 */
export async function getBundles(
  db: Database,
  filters: BundleFilters = {},
  pagination: BundlePaginationOptions = {},
  orderBy: BundleOrderBy = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(bundles.status, filters.status));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(bundles.name, `%${filters.search}%`),
        ilike(bundles.description, `%${filters.search}%`)
      )
    );
  }

  // Active bundles: status is active and within validity dates
  if (filters.activeOnly) {
    const now = new Date();
    conditions.push(eq(bundles.status, 'active'));
    conditions.push(or(eq(bundles.validFrom, sql`NULL`), lte(bundles.validFrom, now)));
    conditions.push(or(eq(bundles.validUntil, sql`NULL`), gte(bundles.validUntil, now)));
  }

  // Build order by
  const orderColumn = {
    name: bundles.name,
    price: bundles.price,
    createdAt: bundles.createdAt,
    updatedAt: bundles.updatedAt,
  }[orderBy];

  const orderFn = orderDirection === 'asc' ? asc : desc;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bundles)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = countResult[0]?.count ?? 0;

  // Get bundles
  const bundlesList = await db
    .select()
    .from(bundles)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderFn(orderColumn))
    .limit(limit)
    .offset(offset);

  return {
    items: bundlesList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get active bundles for the public store
 */
export async function getActiveBundles(
  db: Database,
  limit: number = 10
): Promise<BundleWithItems[]> {
  const now = new Date();

  const bundlesList = await db
    .select()
    .from(bundles)
    .where(
      and(
        eq(bundles.status, 'active'),
        or(sql`${bundles.validFrom} IS NULL`, lte(bundles.validFrom, now)),
        or(sql`${bundles.validUntil} IS NULL`, gte(bundles.validUntil, now))
      )
    )
    .orderBy(desc(bundles.createdAt))
    .limit(limit);

  // Fetch items for each bundle
  const bundlesWithItems = await Promise.all(
    bundlesList.map(async (bundle) => {
      const items = await getBundleItems(db, bundle.id);
      return { ...bundle, items };
    })
  );

  return bundlesWithItems;
}

/**
 * Get bundle by ID
 */
export async function getBundleById(db: Database, id: string): Promise<BundleWithItems | null> {
  const [bundle] = await db.select().from(bundles).where(eq(bundles.id, id)).limit(1);

  if (!bundle) return null;

  const items = await getBundleItems(db, id);
  return { ...bundle, items };
}

/**
 * Get bundle by slug
 */
export async function getBundleBySlug(
  db: Database,
  slug: string,
  activeOnly: boolean = false
): Promise<BundleWithItems | null> {
  const conditions = [eq(bundles.slug, slug)];

  if (activeOnly) {
    const now = new Date();
    conditions.push(eq(bundles.status, 'active'));
    conditions.push(or(sql`${bundles.validFrom} IS NULL`, lte(bundles.validFrom, now))!);
    conditions.push(or(sql`${bundles.validUntil} IS NULL`, gte(bundles.validUntil, now))!);
  }

  const [bundle] = await db
    .select()
    .from(bundles)
    .where(and(...conditions))
    .limit(1);

  if (!bundle) return null;

  const items = await getBundleItems(db, bundle.id);
  return { ...bundle, items };
}

/**
 * Get bundle items with product and variant info
 */
export async function getBundleItems(db: Database, bundleId: string) {
  const items = await db
    .select({
      id: bundleItems.id,
      quantity: bundleItems.quantity,
      productId: bundleItems.productId,
      variantId: bundleItems.variantId,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
      },
    })
    .from(bundleItems)
    .innerJoin(products, eq(bundleItems.productId, products.id))
    .where(eq(bundleItems.bundleId, bundleId));

  // Fetch primary images and variants for each item
  const itemsWithDetails = await Promise.all(
    items.map(async (item) => {
      // Get primary image
      const [image] = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(and(eq(productImages.productId, item.productId), eq(productImages.isPrimary, true)))
        .limit(1);

      // Get variant if specified
      let variant = null;
      if (item.variantId) {
        const [v] = await db
          .select({
            id: productVariants.id,
            name: productVariants.name,
            price: productVariants.price,
          })
          .from(productVariants)
          .where(eq(productVariants.id, item.variantId))
          .limit(1);
        variant = v ?? null;
      }

      return {
        id: item.id,
        quantity: item.quantity,
        product: {
          ...item.product,
          image: image?.url ?? null,
        },
        variant,
      };
    })
  );

  return itemsWithDetails;
}

/**
 * Create a new bundle
 */
export async function createBundle(
  db: Database,
  data: NewBundle,
  items?: Array<Omit<NewBundleItem, 'bundleId'>>
): Promise<BundleWithItems> {
  const [bundle] = await db.insert(bundles).values(data).returning();

  if (!bundle) {
    throw new Error('Failed to create bundle');
  }

  if (items && items.length > 0) {
    await db.insert(bundleItems).values(
      items.map((item) => ({
        ...item,
        bundleId: bundle.id,
      }))
    );
  }

  const bundleItems_ = await getBundleItems(db, bundle.id);
  return { ...bundle, items: bundleItems_ };
}

/**
 * Update a bundle
 */
export async function updateBundle(
  db: Database,
  id: string,
  data: Partial<NewBundle>
): Promise<Bundle | null> {
  const [bundle] = await db.update(bundles).set(data).where(eq(bundles.id, id)).returning();

  return bundle ?? null;
}

/**
 * Delete a bundle
 */
export async function deleteBundle(db: Database, id: string): Promise<boolean> {
  const result = await db.delete(bundles).where(eq(bundles.id, id)).returning();
  return result.length > 0;
}

/**
 * Add item to bundle
 */
export async function addBundleItem(
  db: Database,
  bundleId: string,
  item: Omit<NewBundleItem, 'bundleId'>
): Promise<void> {
  await db.insert(bundleItems).values({
    ...item,
    bundleId,
  });
}

/**
 * Remove item from bundle
 */
export async function removeBundleItem(db: Database, itemId: string): Promise<boolean> {
  const result = await db.delete(bundleItems).where(eq(bundleItems.id, itemId)).returning();
  return result.length > 0;
}

/**
 * Update bundle items (replace all)
 */
export async function updateBundleItems(
  db: Database,
  bundleId: string,
  items: Array<Omit<NewBundleItem, 'bundleId'>>
): Promise<void> {
  // Delete existing items
  await db.delete(bundleItems).where(eq(bundleItems.bundleId, bundleId));

  // Insert new items
  if (items.length > 0) {
    await db.insert(bundleItems).values(
      items.map((item) => ({
        ...item,
        bundleId,
      }))
    );
  }
}
