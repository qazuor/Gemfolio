import { index, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { createId } from '../utils';

// Page status enum
export const pageStatusEnum = pgEnum('page_status', ['draft', 'published']);

// Pages table
export const pages = pgTable(
  'pages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'),
    status: pageStatusEnum('status').default('draft').notNull(),
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
  (table) => [index('pages_slug_idx').on(table.slug), index('pages_status_idx').on(table.status)]
);

// Types
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
