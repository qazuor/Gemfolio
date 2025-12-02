import { and, desc, eq, lt, sql } from 'drizzle-orm';

import type { Database } from '../client';
import {
  type InventoryMovement,
  inventoryMovements,
  type NewInventoryMovement,
} from '../schema/inventory';
import { products, productVariants } from '../schema/products';

// ============================================
// TYPES
// ============================================
export type InventoryFilters = {
  productId?: string;
  variantId?: string;
  type?: InventoryMovement['type'];
};

export type InventoryPaginationOptions = {
  page?: number;
  limit?: number;
};

export type StockItem = {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  currentStock: number;
  lowStockThreshold: number | null;
  isLowStock: boolean;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get all products/variants with stock information
 */
export async function getInventoryStock(
  db: Database,
  filters: { lowStockOnly?: boolean; search?: string } = {},
  pagination: InventoryPaginationOptions = {}
) {
  const { page = 1, limit = 50 } = pagination;
  const offset = (page - 1) * limit;

  // Get products without variants
  const productsWithoutVariants = await db
    .select({
      id: products.id,
      productId: products.id,
      variantId: sql<null>`NULL`,
      productName: products.name,
      variantName: sql<null>`NULL`,
      sku: products.sku,
      currentStock: products.stock,
      lowStockThreshold: products.lowStockThreshold,
    })
    .from(products)
    .where(eq(products.hasVariants, false));

  // Get variants
  const variants = await db
    .select({
      id: productVariants.id,
      productId: productVariants.productId,
      variantId: productVariants.id,
      productName: products.name,
      variantName: productVariants.name,
      sku: productVariants.sku,
      currentStock: productVariants.stock,
      lowStockThreshold: productVariants.lowStockThreshold,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id));

  // Combine and process
  let items: StockItem[] = [
    ...productsWithoutVariants.map((p) => ({
      ...p,
      isLowStock: (p.lowStockThreshold ?? 5) >= p.currentStock,
    })),
    ...variants.map((v) => ({
      ...v,
      isLowStock: (v.lowStockThreshold ?? 5) >= v.currentStock,
    })),
  ];

  // Apply filters
  if (filters.lowStockOnly) {
    items = items.filter((item) => item.isLowStock);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.productName.toLowerCase().includes(searchLower) ||
        item.variantName?.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower)
    );
  }

  // Sort by low stock first, then by product name
  items.sort((a, b) => {
    if (a.isLowStock && !b.isLowStock) return -1;
    if (!a.isLowStock && b.isLowStock) return 1;
    return a.productName.localeCompare(b.productName);
  });

  const total = items.length;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get low stock items count
 */
export async function getLowStockCount(db: Database): Promise<number> {
  // Count products without variants that are low on stock
  const [productsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(
      and(
        eq(products.hasVariants, false),
        lt(products.stock, sql`COALESCE(${products.lowStockThreshold}, 5)`)
      )
    );

  // Count variants that are low on stock
  const [variantsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productVariants)
    .where(lt(productVariants.stock, sql`COALESCE(${productVariants.lowStockThreshold}, 5)`));

  return (productsCount?.count ?? 0) + (variantsCount?.count ?? 0);
}

/**
 * Get low stock items
 */
export async function getLowStockItems(db: Database, limit = 10): Promise<StockItem[]> {
  const result = await getInventoryStock(db, { lowStockOnly: true }, { limit });
  return result.items;
}

/**
 * Get inventory movements with filters and pagination
 */
export async function getInventoryMovements(
  db: Database,
  filters: InventoryFilters = {},
  pagination: InventoryPaginationOptions = {}
) {
  const { page = 1, limit = 50 } = pagination;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.productId) {
    conditions.push(eq(inventoryMovements.productId, filters.productId));
  }

  if (filters.variantId) {
    conditions.push(eq(inventoryMovements.variantId, filters.variantId));
  }

  if (filters.type) {
    conditions.push(eq(inventoryMovements.type, filters.type));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const movements = await db.query.inventoryMovements.findMany({
    where: whereClause,
    with: {
      product: {
        columns: {
          id: true,
          name: true,
        },
      },
      variant: {
        columns: {
          id: true,
          name: true,
          sku: true,
        },
      },
      createdByUser: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [desc(inventoryMovements.createdAt)],
    limit,
    offset,
  });

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(inventoryMovements)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  return {
    items: movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Adjust stock for a product or variant
 */
export async function adjustStock(
  db: Database,
  data: {
    productId?: string;
    variantId?: string;
    type: 'in' | 'out' | 'adjustment' | 'return';
    quantity: number;
    reason?: string;
    createdBy?: string;
    orderId?: string;
  }
): Promise<InventoryMovement> {
  const { productId, variantId, type, quantity, reason, createdBy, orderId } = data;

  if (!productId && !variantId) {
    throw new Error('Either productId or variantId must be provided');
  }

  let previousStock: number;
  let newStock: number;

  if (variantId) {
    // Get current variant stock
    const [variant] = await db
      .select({ stock: productVariants.stock })
      .from(productVariants)
      .where(eq(productVariants.id, variantId));

    if (!variant) {
      throw new Error('Variant not found');
    }

    previousStock = variant.stock;
    newStock = previousStock + quantity;

    // Update variant stock
    await db
      .update(productVariants)
      .set({ stock: newStock })
      .where(eq(productVariants.id, variantId));
  } else if (productId) {
    // Get current product stock
    const [product] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      throw new Error('Product not found');
    }

    previousStock = product.stock;
    newStock = previousStock + quantity;

    // Update product stock
    await db.update(products).set({ stock: newStock }).where(eq(products.id, productId));
  } else {
    throw new Error('Either productId or variantId must be provided');
  }

  // Create movement record
  const movementData: NewInventoryMovement = {
    productId,
    variantId,
    type,
    quantity,
    previousStock,
    newStock,
    reason,
    createdBy,
    orderId,
  };

  const [movement] = await db.insert(inventoryMovements).values(movementData).returning();

  if (!movement) {
    throw new Error('Failed to create inventory movement');
  }

  return movement;
}

/**
 * Get movement history for a product or variant
 */
export async function getProductMovementHistory(
  db: Database,
  productId: string,
  variantId?: string,
  limit = 20
) {
  return getInventoryMovements(
    db,
    {
      productId,
      variantId,
    },
    { limit }
  );
}
