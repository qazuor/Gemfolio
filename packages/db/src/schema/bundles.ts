import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { createId } from '../utils';
import { products, productVariants } from './products';

// Bundle status enum
export const bundleStatusEnum = pgEnum('bundle_status', ['draft', 'active', 'archived']);

// Bundles table
export const bundles = pgTable(
  'bundles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    image: text('image'),
    // Pricing
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    comparePrice: decimal('compare_price', { precision: 10, scale: 2 }), // Sum of individual prices
    // Status and validity
    status: bundleStatusEnum('status').default('draft').notNull(),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('bundles_slug_idx').on(table.slug),
    index('bundles_status_idx').on(table.status),
  ]
);

// Bundle items table
export const bundleItems = pgTable(
  'bundle_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    bundleId: text('bundle_id')
      .notNull()
      .references(() => bundles.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    quantity: integer('quantity').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('bundle_items_bundle_id_idx').on(table.bundleId)]
);

// Relations
export const bundlesRelations = relations(bundles, ({ many }) => ({
  items: many(bundleItems),
}));

export const bundleItemsRelations = relations(bundleItems, ({ one }) => ({
  bundle: one(bundles, {
    fields: [bundleItems.bundleId],
    references: [bundles.id],
  }),
  product: one(products, {
    fields: [bundleItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [bundleItems.variantId],
    references: [productVariants.id],
  }),
}));

// Types
export type Bundle = typeof bundles.$inferSelect;
export type NewBundle = typeof bundles.$inferInsert;
export type BundleItem = typeof bundleItems.$inferSelect;
export type NewBundleItem = typeof bundleItems.$inferInsert;
