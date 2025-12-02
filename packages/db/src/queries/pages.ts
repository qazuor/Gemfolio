import { and, desc, eq, sql } from 'drizzle-orm';

import type { Database } from '../client';
import { type NewPage, type Page, pages } from '../schema/pages';

// ============================================
// TYPES
// ============================================
export type PageFilters = {
  status?: 'draft' | 'published';
};

export type PagePaginationOptions = {
  page?: number;
  limit?: number;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get all pages with optional filters
 */
export async function getPages(
  db: Database,
  filters: PageFilters = {},
  pagination: PagePaginationOptions = {}
) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.status) {
    conditions.push(eq(pages.status, filters.status));
  }

  const result = await db
    .select()
    .from(pages)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(pages.updatedAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pages)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = countResult[0]?.count ?? 0;

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
 * Get page by ID
 */
export async function getPageById(db: Database, id: string): Promise<Page | null> {
  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  return page ?? null;
}

/**
 * Get page by slug
 */
export async function getPageBySlug(
  db: Database,
  slug: string,
  publishedOnly: boolean = false
): Promise<Page | null> {
  const conditions = [eq(pages.slug, slug)];

  if (publishedOnly) {
    conditions.push(eq(pages.status, 'published'));
  }

  const [page] = await db
    .select()
    .from(pages)
    .where(and(...conditions))
    .limit(1);

  return page ?? null;
}

/**
 * Create a new page
 */
export async function createPage(db: Database, data: NewPage): Promise<Page> {
  const [page] = await db.insert(pages).values(data).returning();
  if (!page) {
    throw new Error('Failed to create page');
  }
  return page;
}

/**
 * Update a page
 */
export async function updatePage(
  db: Database,
  id: string,
  data: Partial<NewPage>
): Promise<Page | null> {
  const [page] = await db
    .update(pages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pages.id, id))
    .returning();

  return page ?? null;
}

/**
 * Delete a page
 */
export async function deletePage(db: Database, id: string): Promise<boolean> {
  const result = await db.delete(pages).where(eq(pages.id, id)).returning();
  return result.length > 0;
}
