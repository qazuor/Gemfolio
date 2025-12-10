import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

import type { Database } from '../client';
import {
  type NewReview,
  type NewReviewVote,
  type Review,
  type ReviewVote,
  reviews,
  reviewVotes,
} from '../schema/reviews';

// ============================================
// TYPES
// ============================================

export type ReviewWithUser = Review & {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export type ReviewWithDetails = ReviewWithUser & {
  product?: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
};

// Internal type for DB query results before transformation
type ReviewWithProductImages = ReviewWithUser & {
  product?: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; isPrimary: boolean }>;
  };
};

// Helper to extract primary image from product images
function extractPrimaryImage(images: Array<{ url: string; isPrimary: boolean }>): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.isPrimary);
  return primary?.url ?? images[0]?.url ?? null;
}

// Transform product with images to product with image
function transformProductWithImage(
  product:
    | { id: string; name: string; slug: string; images: Array<{ url: string; isPrimary: boolean }> }
    | null
    | undefined
): { id: string; name: string; slug: string; image: string | null } | undefined {
  if (!product) return undefined;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: extractPrimaryImage(product.images),
  };
}

export type ReviewFilters = {
  productId?: string;
  userId?: string;
  status?: Review['status'];
  minRating?: number;
  maxRating?: number;
  isVerifiedPurchase?: boolean;
};

export type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

// ============================================
// REVIEW QUERIES
// ============================================

/**
 * Get reviews for a product (approved only for public)
 */
export async function getProductReviews(
  db: Database,
  productId: string,
  options: {
    limit?: number;
    offset?: number;
    includeAll?: boolean; // Include non-approved reviews (for admin)
  } = {}
): Promise<ReviewWithUser[]> {
  const { limit = 20, offset = 0, includeAll = false } = options;

  const conditions = [eq(reviews.productId, productId)];
  if (!includeAll) {
    conditions.push(eq(reviews.status, 'approved'));
  }

  const result = await db.query.reviews.findMany({
    where: and(...conditions),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [desc(reviews.createdAt)],
    limit,
    offset,
  });

  return result as ReviewWithUser[];
}

/**
 * Get review statistics for a product
 */
export async function getProductReviewStats(db: Database, productId: string): Promise<ReviewStats> {
  // Get average and total
  const [stats] = await db
    .select({
      averageRating: sql<number>`COALESCE(AVG(rating), 0)`,
      totalReviews: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, 'approved')));

  // Get distribution
  const distribution = await db
    .select({
      rating: reviews.rating,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, 'approved')))
    .groupBy(reviews.rating);

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const d of distribution) {
    if (d.rating >= 1 && d.rating <= 5) {
      ratingDistribution[d.rating as 1 | 2 | 3 | 4 | 5] = Number(d.count);
    }
  }

  return {
    averageRating: Number(stats?.averageRating ?? 0),
    totalReviews: Number(stats?.totalReviews ?? 0),
    ratingDistribution,
  };
}

/**
 * Get user's reviews
 */
export async function getUserReviews(db: Database, userId: string): Promise<ReviewWithDetails[]> {
  const result = await db.query.reviews.findMany({
    where: eq(reviews.userId, userId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      product: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
        with: {
          images: {
            columns: {
              url: true,
              isPrimary: true,
            },
            orderBy: (images, { asc }) => [asc(images.order)],
          },
        },
      },
    },
    orderBy: [desc(reviews.createdAt)],
  });

  return (result as ReviewWithProductImages[]).map((review) => ({
    ...review,
    product: transformProductWithImage(review.product),
  }));
}

/**
 * Get review by ID
 */
export async function getReviewById(db: Database, id: string): Promise<ReviewWithDetails | null> {
  const result = await db.query.reviews.findFirst({
    where: eq(reviews.id, id),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      product: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
        with: {
          images: {
            columns: {
              url: true,
              isPrimary: true,
            },
            orderBy: (images, { asc }) => [asc(images.order)],
          },
        },
      },
    },
  });

  if (!result) return null;

  const typedResult = result as ReviewWithProductImages;
  return {
    ...typedResult,
    product: transformProductWithImage(typedResult.product),
  };
}

/**
 * Check if user can review a product (hasn't reviewed yet)
 */
export async function canUserReviewProduct(
  db: Database,
  userId: string,
  productId: string
): Promise<boolean> {
  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.userId, userId), eq(reviews.productId, productId)),
  });

  return !existing;
}

/**
 * Create a new review
 */
export async function createReview(db: Database, data: NewReview): Promise<Review> {
  const result = await db.insert(reviews).values(data).returning();

  if (!result[0]) {
    throw new Error('Failed to create review');
  }

  return result[0];
}

/**
 * Update a review
 */
export async function updateReview(
  db: Database,
  id: string,
  data: Partial<NewReview>
): Promise<Review | null> {
  const result = await db
    .update(reviews)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(reviews.id, id))
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a review
 */
export async function deleteReview(db: Database, id: string): Promise<boolean> {
  const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
  return result.length > 0;
}

/**
 * Moderate a review (approve/reject)
 */
export async function moderateReview(
  db: Database,
  id: string,
  status: 'approved' | 'rejected',
  moderatedBy: string,
  note?: string
): Promise<Review | null> {
  const result = await db
    .update(reviews)
    .set({
      status,
      moderatedBy,
      moderatedAt: new Date(),
      moderationNote: note,
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, id))
    .returning();

  return result[0] ?? null;
}

/**
 * Add admin response to a review
 */
export async function addAdminResponse(
  db: Database,
  id: string,
  response: string,
  respondedBy: string
): Promise<Review | null> {
  const result = await db
    .update(reviews)
    .set({
      adminResponse: response,
      adminResponseAt: new Date(),
      adminRespondedBy: respondedBy,
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, id))
    .returning();

  return result[0] ?? null;
}

/**
 * Get pending reviews (for admin moderation)
 */
export async function getPendingReviews(
  db: Database,
  options: { limit?: number; offset?: number } = {}
): Promise<ReviewWithDetails[]> {
  const { limit = 20, offset = 0 } = options;

  const result = await db.query.reviews.findMany({
    where: eq(reviews.status, 'pending'),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      product: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
        with: {
          images: {
            columns: {
              url: true,
              isPrimary: true,
            },
            orderBy: (images, { asc }) => [asc(images.order)],
          },
        },
      },
    },
    orderBy: [desc(reviews.createdAt)],
    limit,
    offset,
  });

  return (result as ReviewWithProductImages[]).map((review) => ({
    ...review,
    product: transformProductWithImage(review.product),
  }));
}

/**
 * Get all reviews with filters (for admin)
 */
export async function getReviews(
  db: Database,
  filters: ReviewFilters = {},
  options: { limit?: number; offset?: number } = {}
): Promise<{ items: ReviewWithDetails[]; total: number }> {
  const { limit = 20, offset = 0 } = options;

  const conditions = [];

  if (filters.productId) {
    conditions.push(eq(reviews.productId, filters.productId));
  }
  if (filters.userId) {
    conditions.push(eq(reviews.userId, filters.userId));
  }
  if (filters.status) {
    conditions.push(eq(reviews.status, filters.status));
  }
  if (filters.minRating) {
    conditions.push(gte(reviews.rating, filters.minRating));
  }
  if (filters.maxRating) {
    conditions.push(lte(reviews.rating, filters.maxRating));
  }
  if (filters.isVerifiedPurchase !== undefined) {
    conditions.push(eq(reviews.isVerifiedPurchase, filters.isVerifiedPurchase));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db.query.reviews.findMany({
      where: whereClause,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
          with: {
            images: {
              columns: {
                url: true,
                isPrimary: true,
              },
              orderBy: (images, { asc }) => [asc(images.order)],
            },
          },
        },
      },
      orderBy: [desc(reviews.createdAt)],
      limit,
      offset,
    }),
    db.select({ count: sql<number>`count(*)` }).from(reviews).where(whereClause),
  ]);

  return {
    items: (items as ReviewWithProductImages[]).map((review) => ({
      ...review,
      product: transformProductWithImage(review.product),
    })),
    total: Number(countResult[0]?.count ?? 0),
  };
}

// ============================================
// REVIEW VOTE QUERIES
// ============================================

/**
 * Vote on a review (helpful/not helpful)
 */
export async function voteOnReview(db: Database, data: NewReviewVote): Promise<ReviewVote> {
  // Upsert the vote
  const result = await db
    .insert(reviewVotes)
    .values(data)
    .onConflictDoUpdate({
      target: [reviewVotes.userId, reviewVotes.reviewId],
      set: { isHelpful: data.isHelpful },
    })
    .returning();

  if (!result[0]) {
    throw new Error('Failed to vote on review');
  }

  // Update helpful counts on the review
  await updateReviewHelpfulCounts(db, data.reviewId);

  return result[0];
}

/**
 * Remove vote from a review
 */
export async function removeVote(db: Database, userId: string, reviewId: string): Promise<boolean> {
  const result = await db
    .delete(reviewVotes)
    .where(and(eq(reviewVotes.userId, userId), eq(reviewVotes.reviewId, reviewId)))
    .returning();

  if (result.length > 0) {
    await updateReviewHelpfulCounts(db, reviewId);
  }

  return result.length > 0;
}

/**
 * Get user's vote on a review
 */
export async function getUserVote(
  db: Database,
  userId: string,
  reviewId: string
): Promise<ReviewVote | null> {
  const result = await db.query.reviewVotes.findFirst({
    where: and(eq(reviewVotes.userId, userId), eq(reviewVotes.reviewId, reviewId)),
  });

  return result ?? null;
}

/**
 * Update helpful counts on a review
 */
async function updateReviewHelpfulCounts(db: Database, reviewId: string): Promise<void> {
  const [helpfulResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviewVotes)
    .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.isHelpful, true)));

  const [notHelpfulResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviewVotes)
    .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.isHelpful, false)));

  await db
    .update(reviews)
    .set({
      helpfulCount: Number(helpfulResult?.count ?? 0),
      notHelpfulCount: Number(notHelpfulResult?.count ?? 0),
    })
    .where(eq(reviews.id, reviewId));
}
