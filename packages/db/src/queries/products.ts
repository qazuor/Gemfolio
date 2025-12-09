import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import type { Database } from '../client';
import { categories } from '../schema/categories';
import {
  type NewProduct,
  type Product,
  productImages,
  products,
  productVariants,
} from '../schema/products';
import { productTags, tags } from '../schema/tags';

// ============================================
// TYPES
// ============================================
export type ProductFilters = {
  categoryId?: string;
  categorySlug?: string;
  status?: 'draft' | 'active' | 'archived';
  isFeatured?: boolean;
  tagIds?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

export type ProductOrderBy = 'name' | 'price' | 'createdAt' | 'updatedAt';
export type OrderDirection = 'asc' | 'desc';

export type ProductPaginationOptions = {
  page?: number;
  limit?: number;
};

export type ProductWithRelations = Product & {
  category: { id: string; name: string; slug: string } | null;
  images: Array<{ id: string; url: string; alt: string | null; isPrimary: boolean }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: string;
    stock: number;
    attributes: Record<string, string>;
  }>;
  tags: Array<{ id: string; name: string; slug: string; color: string | null }>;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get products with filters, pagination, and sorting
 */
export async function getProducts(
  db: Database,
  filters: ProductFilters = {},
  pagination: ProductPaginationOptions = {},
  orderBy: ProductOrderBy = 'createdAt',
  orderDirection: OrderDirection = 'desc'
) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(products.status, filters.status));
  }

  if (filters.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }

  if (filters.isFeatured !== undefined) {
    conditions.push(eq(products.isFeatured, filters.isFeatured));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(products.name, `%${filters.search}%`),
        ilike(products.shortDescription, `%${filters.search}%`)
      )
    );
  }

  if (filters.minPrice !== undefined) {
    conditions.push(sql`${products.price}::numeric >= ${filters.minPrice}`);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(sql`${products.price}::numeric <= ${filters.maxPrice}`);
  }

  if (filters.inStock) {
    conditions.push(sql`${products.stock} > 0`);
  }

  // Build order by
  const orderColumn = {
    name: products.name,
    price: products.price,
    createdAt: products.createdAt,
    updatedAt: products.updatedAt,
  }[orderBy];

  const orderFn = orderDirection === 'asc' ? asc : desc;

  // Get products with category
  const result = await db
    .select({
      product: products,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderFn(orderColumn))
    .limit(limit)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(countResult[0]?.count ?? 0);

  // Get images and tags for each product
  const productIds = result.map((r) => r.product.id);

  const imagesResult =
    productIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.order))
      : [];

  const tagsResult =
    productIds.length > 0
      ? await db
          .select({
            productId: productTags.productId,
            tag: {
              id: tags.id,
              name: tags.name,
              slug: tags.slug,
              color: tags.color,
            },
          })
          .from(productTags)
          .innerJoin(tags, eq(productTags.tagId, tags.id))
          .where(inArray(productTags.productId, productIds))
      : [];

  // Combine results
  const items = result.map((r) => ({
    ...r.product,
    category: r.category,
    images: imagesResult
      .filter((img) => img.productId === r.product.id)
      .map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
      })),
    tags: tagsResult.filter((t) => t.productId === r.product.id).map((t) => t.tag),
    variants: [] as ProductWithRelations['variants'],
  }));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single product by slug with all relations
 */
export async function getProductBySlug(
  db: Database,
  slug: string
): Promise<ProductWithRelations | null> {
  const result = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      category: true,
      images: {
        orderBy: [asc(productImages.order)],
      },
      videos: true,
      variants: true,
      productTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!result) return null;

  return {
    ...result,
    category: result.category
      ? { id: result.category.id, name: result.category.name, slug: result.category.slug }
      : null,
    images: result.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
    })),
    variants: result.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      attributes: v.attributes as Record<string, string>,
    })),
    tags: result.productTags.map((pt) => ({
      id: pt.tag.id,
      name: pt.tag.name,
      slug: pt.tag.slug,
      color: pt.tag.color,
    })),
  };
}

/**
 * Get a single product by ID (for admin)
 */
export async function getProductById(db: Database, id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      images: {
        orderBy: [asc(productImages.order)],
      },
      videos: true,
      variants: true,
      productTags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

/**
 * Get related products by category
 */
export async function getRelatedProducts(
  db: Database,
  productId: string,
  categoryId: string | null,
  limit = 4
) {
  if (!categoryId) return [];

  const result = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.status, 'active'),
        sql`${products.id} != ${productId}`
      )
    )
    .limit(limit);

  return result;
}

/**
 * Search products with fuzzy matching
 */
export async function searchProducts(db: Database, query: string, limit = 10) {
  const searchPattern = `%${query}%`;

  const result = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      image: sql<string>`(SELECT url FROM ${productImages} WHERE product_id = ${products.id} AND is_primary = true LIMIT 1)`,
    })
    .from(products)
    .where(
      and(
        eq(products.status, 'active'),
        or(
          ilike(products.name, searchPattern),
          ilike(products.shortDescription, searchPattern),
          ilike(products.sku, searchPattern)
        )
      )
    )
    .limit(limit);

  return result;
}

/**
 * Create a new product
 */
export async function createProduct(db: Database, data: NewProduct) {
  const result = await db.insert(products).values(data).returning();
  return result[0];
}

/**
 * Update a product
 */
export async function updateProduct(db: Database, id: string, data: Partial<NewProduct>) {
  const result = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a product
 */
export async function deleteProduct(db: Database, id: string) {
  const result = await db.delete(products).where(eq(products.id, id)).returning();
  return result[0];
}

/**
 * Add images to a product
 */
export async function addProductImages(
  db: Database,
  productId: string,
  images: Array<{ url: string; alt?: string; order?: number; isPrimary?: boolean }>
) {
  const result = await db
    .insert(productImages)
    .values(images.map((img, idx) => ({ productId, order: img.order ?? idx, ...img })))
    .returning();
  return result;
}

/**
 * Add variants to a product
 */
export async function addProductVariants(
  db: Database,
  productId: string,
  variants: Array<{
    name: string;
    sku: string;
    price: string;
    stock: number;
    attributes: Record<string, string>;
    isDefault?: boolean;
  }>
) {
  const result = await db
    .insert(productVariants)
    .values(variants.map((v, idx) => ({ productId, isDefault: idx === 0, ...v })))
    .returning();
  return result;
}

/**
 * Add tags to a product
 */
export async function addProductTags(db: Database, productId: string, tagIds: string[]) {
  const result = await db
    .insert(productTags)
    .values(tagIds.map((tagId) => ({ productId, tagId })))
    .returning();
  return result;
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(db: Database, limit = 8) {
  return getProducts(db, { isFeatured: true, status: 'active' }, { limit });
}

/**
 * Get products by tag
 */
export async function getProductsByTag(
  db: Database,
  tagSlug: string,
  pagination: ProductPaginationOptions = {}
) {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, tagSlug),
  });

  if (!tag) return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };

  return getProducts(db, { tagIds: [tag.id], status: 'active' }, pagination);
}

/**
 * Get product images
 */
export async function getProductImages(db: Database, productId: string) {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.order));
}

/**
 * Delete a product image
 */
export async function deleteProductImage(db: Database, imageId: string) {
  const result = await db.delete(productImages).where(eq(productImages.id, imageId)).returning();
  return result[0];
}

/**
 * Update a product image
 */
export async function updateProductImage(
  db: Database,
  imageId: string,
  data: { alt?: string; order?: number; isPrimary?: boolean }
) {
  const result = await db
    .update(productImages)
    .set(data)
    .where(eq(productImages.id, imageId))
    .returning();
  return result[0];
}

/**
 * Set primary image for a product (and unset others)
 */
export async function setProductPrimaryImage(db: Database, productId: string, imageId: string) {
  // First, unset all primary images for this product
  await db
    .update(productImages)
    .set({ isPrimary: false })
    .where(eq(productImages.productId, productId));

  // Then set the new primary image
  const result = await db
    .update(productImages)
    .set({ isPrimary: true })
    .where(eq(productImages.id, imageId))
    .returning();

  return result[0];
}

/**
 * Reorder product images
 */
export async function reorderProductImages(db: Database, productId: string, imageIds: string[]) {
  const updates = imageIds.map((id, index) =>
    db
      .update(productImages)
      .set({ order: index })
      .where(and(eq(productImages.id, id), eq(productImages.productId, productId)))
  );

  await Promise.all(updates);
}

// ============================================
// PRODUCT VARIANTS
// ============================================

/**
 * Get variants for a product
 */
export async function getProductVariants(db: Database, productId: string) {
  return db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(desc(productVariants.isDefault), asc(productVariants.name));
}

/**
 * Get a single variant by ID
 */
export async function getVariantById(db: Database, variantId: string) {
  return db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
}

/**
 * Update a product variant
 */
export async function updateProductVariant(
  db: Database,
  variantId: string,
  data: {
    name?: string;
    sku?: string;
    price?: string;
    comparePrice?: string | null;
    stock?: number;
    lowStockThreshold?: number;
    attributes?: Record<string, string>;
    image?: string | null;
    isDefault?: boolean;
  }
) {
  const result = await db
    .update(productVariants)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productVariants.id, variantId))
    .returning();
  return result[0];
}

/**
 * Delete a product variant
 */
export async function deleteProductVariant(db: Database, variantId: string) {
  const result = await db
    .delete(productVariants)
    .where(eq(productVariants.id, variantId))
    .returning();
  return result[0];
}

/**
 * Set a variant as default (and unset others)
 */
export async function setDefaultVariant(db: Database, productId: string, variantId: string) {
  // First, unset all default variants for this product
  await db
    .update(productVariants)
    .set({ isDefault: false })
    .where(eq(productVariants.productId, productId));

  // Then set the new default variant
  const result = await db
    .update(productVariants)
    .set({ isDefault: true })
    .where(eq(productVariants.id, variantId))
    .returning();

  return result[0];
}

/**
 * Enable variants for a product
 */
export async function enableProductVariants(db: Database, productId: string) {
  const result = await db
    .update(products)
    .set({ hasVariants: true, updatedAt: new Date() })
    .where(eq(products.id, productId))
    .returning();
  return result[0];
}

/**
 * Disable variants for a product (also deletes all variants)
 */
export async function disableProductVariants(db: Database, productId: string) {
  // Delete all variants
  await db.delete(productVariants).where(eq(productVariants.productId, productId));

  // Update product
  const result = await db
    .update(products)
    .set({ hasVariants: false, updatedAt: new Date() })
    .where(eq(products.id, productId))
    .returning();
  return result[0];
}

/**
 * Duplicate a product with all its images, variants, and tags
 */
export async function duplicateProduct(db: Database, productId: string) {
  // Get the original product with all relations
  const original = await getProductById(db, productId);

  if (!original) {
    return null;
  }

  // Generate new slug
  const baseSlug = original.slug.replace(/-copy(-\d+)?$/, '');
  let newSlug = `${baseSlug}-copy`;
  let counter = 1;

  // Check if slug exists and generate unique one
  while (true) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, newSlug),
    });
    if (!existing) break;
    counter++;
    newSlug = `${baseSlug}-copy-${counter}`;
  }

  // Create the duplicate product
  const [newProduct] = await db
    .insert(products)
    .values({
      name: `${original.name} (Copia)`,
      slug: newSlug,
      categoryId: original.categoryId,
      shortDescription: original.shortDescription,
      description: original.description,
      price: original.price,
      comparePrice: original.comparePrice,
      cost: original.cost,
      sku: original.sku ? `${original.sku}-COPY` : null,
      stock: original.stock,
      lowStockThreshold: original.lowStockThreshold,
      trackInventory: original.trackInventory,
      hasVariants: original.hasVariants,
      status: 'draft', // Always create as draft
      isFeatured: false, // Don't copy featured status
      seoTitle: original.seoTitle,
      seoDescription: original.seoDescription,
      seoImage: original.seoImage,
    })
    .returning();

  if (!newProduct) {
    return null;
  }

  // Duplicate images
  if (original.images && original.images.length > 0) {
    await db.insert(productImages).values(
      original.images.map((img) => ({
        productId: newProduct.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
        isPrimary: img.isPrimary,
      }))
    );
  }

  // Duplicate variants
  if (original.variants && original.variants.length > 0) {
    await db.insert(productVariants).values(
      original.variants.map((variant) => ({
        productId: newProduct.id,
        name: variant.name,
        sku: `${variant.sku}-COPY`,
        price: variant.price,
        comparePrice: variant.comparePrice,
        stock: variant.stock,
        lowStockThreshold: variant.lowStockThreshold,
        attributes: variant.attributes as Record<string, string>,
        image: variant.image,
        isDefault: variant.isDefault,
      }))
    );
  }

  // Duplicate tags
  if (original.productTags && original.productTags.length > 0) {
    await db.insert(productTags).values(
      original.productTags.map((pt) => ({
        productId: newProduct.id,
        tagId: pt.tagId,
      }))
    );
  }

  // Return the complete new product
  return getProductById(db, newProduct.id);
}
