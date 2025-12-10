import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { createId } from '../utils';
import { products } from './products';
import { users } from './users';

// Wishlists table - stores user's favorite products
export const wishlists = pgTable(
  'wishlists',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('wishlists_user_id_idx').on(table.userId),
    index('wishlists_product_id_idx').on(table.productId),
    // Unique constraint to prevent duplicate items in wishlist
    uniqueIndex('wishlists_user_product_unique_idx').on(table.userId, table.productId),
  ]
);

// Relations
export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

// Types
export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
