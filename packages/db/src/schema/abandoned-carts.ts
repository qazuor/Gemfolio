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
} from 'drizzle-orm/pg-core';

import { createId } from '../utils';
import { carts } from './carts';
import { users } from './users';

// Abandoned cart status enum
export const abandonedCartStatusEnum = pgEnum('abandoned_cart_status', [
  'pending', // Just abandoned, no recovery attempt yet
  'email_sent', // First recovery email sent
  'follow_up_sent', // Follow-up email sent
  'recovered', // Cart was recovered (order placed)
  'expired', // Too old, no longer attempting recovery
  'unsubscribed', // Customer opted out of recovery emails
]);

// Abandoned carts table - tracks carts left without completing checkout
export const abandonedCarts = pgTable(
  'abandoned_carts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    cartId: text('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    // Customer info (for guest checkouts)
    customerEmail: text('customer_email'),
    customerName: text('customer_name'),
    // Cart snapshot at abandonment time
    cartTotal: decimal('cart_total', { precision: 10, scale: 2 }).notNull(),
    itemCount: integer('item_count').notNull(),
    cartSnapshot: jsonb('cart_snapshot').$type<{
      items: Array<{
        productId: string;
        productName: string;
        variantId?: string;
        variantName?: string;
        quantity: number;
        price: string;
        image?: string;
      }>;
      couponCode?: string;
    }>(),
    // Recovery status
    status: abandonedCartStatusEnum('status').default('pending').notNull(),
    // Email tracking
    recoveryEmailSentAt: timestamp('recovery_email_sent_at', { withTimezone: true }),
    followUpEmailSentAt: timestamp('follow_up_email_sent_at', { withTimezone: true }),
    emailOpenedAt: timestamp('email_opened_at', { withTimezone: true }),
    emailClickedAt: timestamp('email_clicked_at', { withTimezone: true }),
    recoveryAttempts: integer('recovery_attempts').default(0).notNull(),
    // Recovery result
    isRecovered: boolean('is_recovered').default(false).notNull(),
    recoveredAt: timestamp('recovered_at', { withTimezone: true }),
    recoveredOrderId: text('recovered_order_id'),
    // Discount offered for recovery
    discountCode: text('discount_code'),
    discountPercent: integer('discount_percent'),
    // Timing
    abandonedAt: timestamp('abandoned_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    // Metadata
    source: text('source'), // Where the cart was abandoned (checkout, cart page, etc.)
    userAgent: text('user_agent'),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('abandoned_carts_cart_id_idx').on(table.cartId),
    index('abandoned_carts_user_id_idx').on(table.userId),
    index('abandoned_carts_customer_email_idx').on(table.customerEmail),
    index('abandoned_carts_status_idx').on(table.status),
    index('abandoned_carts_is_recovered_idx').on(table.isRecovered),
    index('abandoned_carts_abandoned_at_idx').on(table.abandonedAt),
    index('abandoned_carts_expires_at_idx').on(table.expiresAt),
  ]
);

// Relations
export const abandonedCartsRelations = relations(abandonedCarts, ({ one }) => ({
  cart: one(carts, {
    fields: [abandonedCarts.cartId],
    references: [carts.id],
  }),
  user: one(users, {
    fields: [abandonedCarts.userId],
    references: [users.id],
  }),
}));

// Types
export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type NewAbandonedCart = typeof abandonedCarts.$inferInsert;
export type AbandonedCartStatus = (typeof abandonedCartStatusEnum.enumValues)[number];
