import { relations } from 'drizzle-orm';
import {
  boolean,
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

import { createId } from '../utils';
import { categories } from './categories';

// Product status enum
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived']);

// Products table
export const products = pgTable(
  'products',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
    shortDescription: text('short_description'),
    description: text('description'),
    // Pricing (base price for products without variants)
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    comparePrice: decimal('compare_price', { precision: 10, scale: 2 }),
    cost: decimal('cost', { precision: 10, scale: 2 }),
    // Inventory (for products without variants)
    sku: varchar('sku', { length: 100 }),
    stock: integer('stock').default(0).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(5),
    trackInventory: boolean('track_inventory').default(true).notNull(),
    // Variants
    hasVariants: boolean('has_variants').default(false).notNull(),
    // Status
    status: productStatusEnum('status').default('draft').notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    // SEO
    seoTitle: varchar('seo_title', { length: 70 }),
    seoDescription: varchar('seo_description', { length: 160 }),
    seoImage: text('seo_image'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('products_slug_idx').on(table.slug),
    index('products_category_id_idx').on(table.categoryId),
    index('products_status_idx').on(table.status),
    index('products_sku_idx').on(table.sku),
  ]
);

// Product variants table
export const productVariants = pgTable(
  'product_variants',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: varchar('sku', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    // Pricing
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    comparePrice: decimal('compare_price', { precision: 10, scale: 2 }),
    // Inventory
    stock: integer('stock').default(0).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(5),
    // Attributes (e.g., { "size": "M", "color": "gold" })
    attributes: jsonb('attributes').$type<Record<string, string>>().notNull(),
    image: text('image'),
    isDefault: boolean('is_default').default(false).notNull(),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('product_variants_product_id_idx').on(table.productId),
    index('product_variants_sku_idx').on(table.sku),
  ]
);

// Product images table
export const productImages = pgTable(
  'product_images',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: varchar('alt', { length: 255 }),
    order: integer('order').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('product_images_product_id_idx').on(table.productId),
    index('product_images_variant_id_idx').on(table.variantId),
  ]
);

// Product videos table
export const productVideos = pgTable(
  'product_videos',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    title: varchar('title', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('product_videos_product_id_idx').on(table.productId)]
);

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  videos: many(productVideos),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [productImages.variantId],
    references: [productVariants.id],
  }),
}));

export const productVideosRelations = relations(productVideos, ({ one }) => ({
  product: one(products, {
    fields: [productVideos.productId],
    references: [products.id],
  }),
}));

// Types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductVideo = typeof productVideos.$inferSelect;
export type NewProductVideo = typeof productVideos.$inferInsert;
