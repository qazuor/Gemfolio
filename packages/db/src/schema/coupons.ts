import {
  boolean,
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

// Coupon type enum
export const couponTypeEnum = pgEnum('coupon_type', [
  'percentage', // Porcentaje de descuento
  'fixed', // Monto fijo
  'free_shipping', // Envío gratis
]);

// Coupons table
export const coupons = pgTable(
  'coupons',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: text('description'),
    type: couponTypeEnum('type').notNull(),
    value: decimal('value', { precision: 10, scale: 2 }).notNull(), // Percentage or fixed amount
    // Limits
    minimumPurchase: decimal('minimum_purchase', { precision: 10, scale: 2 }),
    maximumDiscount: decimal('maximum_discount', { precision: 10, scale: 2 }), // For percentage coupons
    usageLimit: integer('usage_limit'), // Total usage limit
    usageCount: integer('usage_count').default(0).notNull(),
    usagePerUser: integer('usage_per_user').default(1), // Limit per user
    // Validity
    isActive: boolean('is_active').default(true).notNull(),
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
    index('coupons_code_idx').on(table.code),
    index('coupons_is_active_idx').on(table.isActive),
  ]
);

// Types
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
