import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

import { createId } from '../utils';
import { orders } from './orders';
import { products } from './products';
import { users } from './users';

// Review status enum
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

// Reviews table - product reviews by customers
export const reviews = pgTable(
  'reviews',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
    // Rating and content
    rating: integer('rating').notNull(), // 1-5 stars
    title: varchar('title', { length: 255 }),
    content: text('content').notNull(),
    // Verification
    isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
    // Moderation
    status: reviewStatusEnum('status').default('pending').notNull(),
    moderatedBy: text('moderated_by').references(() => users.id, { onDelete: 'set null' }),
    moderatedAt: timestamp('moderated_at', { withTimezone: true }),
    moderationNote: text('moderation_note'),
    // Helpfulness
    helpfulCount: integer('helpful_count').default(0).notNull(),
    notHelpfulCount: integer('not_helpful_count').default(0).notNull(),
    // Response from admin/owner
    adminResponse: text('admin_response'),
    adminResponseAt: timestamp('admin_response_at', { withTimezone: true }),
    adminRespondedBy: text('admin_responded_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('reviews_product_id_idx').on(table.productId),
    index('reviews_user_id_idx').on(table.userId),
    index('reviews_order_id_idx').on(table.orderId),
    index('reviews_status_idx').on(table.status),
    index('reviews_rating_idx').on(table.rating),
    index('reviews_created_at_idx').on(table.createdAt),
    // One review per user per product
    uniqueIndex('reviews_user_product_unique_idx').on(table.userId, table.productId),
  ]
);

// Review helpfulness votes - tracks who voted on which review
export const reviewVotes = pgTable(
  'review_votes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    reviewId: text('review_id')
      .notNull()
      .references(() => reviews.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isHelpful: boolean('is_helpful').notNull(), // true = helpful, false = not helpful
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('review_votes_review_id_idx').on(table.reviewId),
    index('review_votes_user_id_idx').on(table.userId),
    // One vote per user per review
    uniqueIndex('review_votes_user_review_unique_idx').on(table.userId, table.reviewId),
  ]
);

// Relations
export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  moderator: one(users, {
    fields: [reviews.moderatedBy],
    references: [users.id],
    relationName: 'moderator',
  }),
  adminResponder: one(users, {
    fields: [reviews.adminRespondedBy],
    references: [users.id],
    relationName: 'adminResponder',
  }),
  votes: many(reviewVotes),
}));

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewVotes.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewVotes.userId],
    references: [users.id],
  }),
}));

// Types
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewVote = typeof reviewVotes.$inferSelect;
export type NewReviewVote = typeof reviewVotes.$inferInsert;
