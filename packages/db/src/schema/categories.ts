import { relations } from 'drizzle-orm';
import { index, integer, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { createId } from '../utils';

// Category status enum
export const categoryStatusEnum = pgEnum('category_status', ['draft', 'active', 'archived']);

// Categories table
export const categories = pgTable(
  'categories',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    image: text('image'),
    parentId: text('parent_id'),
    order: integer('order').default(0).notNull(),
    status: categoryStatusEnum('status').default('active').notNull(),
    // SEO
    seoTitle: varchar('seo_title', { length: 70 }),
    seoDescription: varchar('seo_description', { length: 160 }),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('categories_slug_idx').on(table.slug),
    index('categories_parent_id_idx').on(table.parentId),
  ]
);

// Self-reference for parent category
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parent_child',
  }),
  children: many(categories, {
    relationName: 'parent_child',
  }),
}));

// Types
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
