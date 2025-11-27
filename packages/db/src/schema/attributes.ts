import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { createId } from '../utils';
import { categories } from './categories';

// Attribute types
export const attributeTypeEnum = pgEnum('attribute_type', ['select', 'color', 'size', 'text']);

// Attribute value type for jsonb
export type AttributeValue = {
  value: string;
  label: string;
  color?: string; // For color type attributes
  order?: number;
};

// ============================================
// ATTRIBUTES TABLE
// ============================================
export const attributes = pgTable(
  'attributes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    type: attributeTypeEnum('type').notNull().default('select'),
    values: jsonb('values').$type<AttributeValue[]>().notNull().default([]),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('attributes_slug_idx').on(table.slug),
    index('attributes_type_idx').on(table.type),
  ]
);

// ============================================
// CATEGORY ATTRIBUTES (Many-to-Many)
// ============================================
export const categoryAttributes = pgTable(
  'category_attributes',
  {
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    attributeId: text('attribute_id')
      .notNull()
      .references(() => attributes.id, { onDelete: 'cascade' }),
    required: integer('required').notNull().default(0), // 0 = false, 1 = true
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.categoryId, table.attributeId] }),
    index('category_attributes_category_id_idx').on(table.categoryId),
  ]
);

// ============================================
// RELATIONS
// ============================================
export const attributesRelations = relations(attributes, ({ many }) => ({
  categoryAttributes: many(categoryAttributes),
}));

export const categoryAttributesRelations = relations(categoryAttributes, ({ one }) => ({
  category: one(categories, {
    fields: [categoryAttributes.categoryId],
    references: [categories.id],
  }),
  attribute: one(attributes, {
    fields: [categoryAttributes.attributeId],
    references: [attributes.id],
  }),
}));

// ============================================
// TYPES
// ============================================
export type Attribute = typeof attributes.$inferSelect;
export type NewAttribute = typeof attributes.$inferInsert;
export type CategoryAttribute = typeof categoryAttributes.$inferSelect;
export type NewCategoryAttribute = typeof categoryAttributes.$inferInsert;
