import { asc, eq, isNull, sql } from 'drizzle-orm';

import type { Database } from '../client';
import { type Category, categories, type NewCategory } from '../schema/categories';
import { products } from '../schema/products';

// ============================================
// TYPES
// ============================================
export type CategoryWithChildren = Category & {
  children: CategoryWithChildren[];
  productCount?: number;
};

export type CategoryWithProducts = Category & {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: string;
  }>;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get category tree (hierarchical structure)
 */
export async function getCategoryTree(
  db: Database,
  status?: 'draft' | 'active' | 'archived'
): Promise<CategoryWithChildren[]> {
  const conditions = status ? eq(categories.status, status) : undefined;

  const allCategories = await db
    .select()
    .from(categories)
    .where(conditions)
    .orderBy(asc(categories.order), asc(categories.name));

  // Build tree structure
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create all nodes
  for (const cat of allCategories) {
    categoryMap.set(cat.id, { ...cat, children: [] });
  }

  // Second pass: build tree
  for (const cat of allCategories) {
    const node = categoryMap.get(cat.id)!;
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  }

  return rootCategories;
}

/**
 * Get category tree with product counts
 */
export async function getCategoryTreeWithCounts(db: Database): Promise<CategoryWithChildren[]> {
  const allCategories = await db
    .select({
      category: categories,
      productCount: sql<number>`(
        SELECT COUNT(*) FROM ${products}
        WHERE category_id = ${categories.id}
        AND status = 'active'
      )`,
    })
    .from(categories)
    .where(eq(categories.status, 'active'))
    .orderBy(asc(categories.order), asc(categories.name));

  // Build tree structure
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create all nodes
  for (const { category, productCount } of allCategories) {
    categoryMap.set(category.id, { ...category, children: [], productCount: Number(productCount) });
  }

  // Second pass: build tree
  for (const { category } of allCategories) {
    const node = categoryMap.get(category.id)!;
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  }

  return rootCategories;
}

/**
 * Get category by slug with products
 */
export async function getCategoryBySlug(
  db: Database,
  slug: string,
  includeProducts = false
): Promise<CategoryWithProducts | Category | null> {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (!category) return null;

  if (includeProducts) {
    const categoryProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
      })
      .from(products)
      .where(eq(products.categoryId, category.id));

    return { ...category, products: categoryProducts };
  }

  return category;
}

/**
 * Get category by ID
 */
export async function getCategoryById(db: Database, id: string) {
  return db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: {
      parent: true,
      children: true,
    },
  });
}

/**
 * Get subcategories of a category
 */
export async function getSubcategories(db: Database, parentId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.parentId, parentId))
    .orderBy(asc(categories.order), asc(categories.name));
}

/**
 * Get root categories (no parent)
 */
export async function getRootCategories(db: Database) {
  return db
    .select()
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(asc(categories.order), asc(categories.name));
}

/**
 * Create a new category
 */
export async function createCategory(db: Database, data: NewCategory) {
  const result = await db.insert(categories).values(data).returning();
  return result[0];
}

/**
 * Update a category
 */
export async function updateCategory(db: Database, id: string, data: Partial<NewCategory>) {
  const result = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a category
 */
export async function deleteCategory(db: Database, id: string) {
  // First, update children to have no parent (or move to parent of deleted category)
  const category = await getCategoryById(db, id);

  if (category) {
    // Update children to point to the deleted category's parent
    await db
      .update(categories)
      .set({ parentId: category.parentId })
      .where(eq(categories.parentId, id));

    // Update products to have no category
    await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
  }

  const result = await db.delete(categories).where(eq(categories.id, id)).returning();
  return result[0];
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  db: Database,
  reorderData: Array<{ id: string; order: number; parentId?: string | null }>
) {
  const results = [];

  for (const item of reorderData) {
    const result = await db
      .update(categories)
      .set({
        order: item.order,
        parentId: item.parentId,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, item.id))
      .returning();
    results.push(result[0]);
  }

  return results;
}

/**
 * Get category breadcrumb (path from root to category)
 */
export async function getCategoryBreadcrumb(db: Database, categoryId: string): Promise<Category[]> {
  const breadcrumb: Category[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const category: Category | undefined = await db.query.categories.findFirst({
      where: eq(categories.id, currentId),
    });

    if (category) {
      breadcrumb.unshift(category);
      currentId = category.parentId;
    } else {
      break;
    }
  }

  return breadcrumb;
}

/**
 * Check if a category has children
 */
export async function categoryHasChildren(db: Database, categoryId: string): Promise<boolean> {
  const children = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories)
    .where(eq(categories.parentId, categoryId));

  return Number(children[0]?.count ?? 0) > 0;
}

/**
 * Check if a category has products
 */
export async function categoryHasProducts(db: Database, categoryId: string): Promise<boolean> {
  const productCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.categoryId, categoryId));

  return Number(productCount[0]?.count ?? 0) > 0;
}
