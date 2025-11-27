import { and, eq, lt, sql } from 'drizzle-orm';

import type { Database } from '../client';
import { type Cart, cartItems, carts, type NewCart } from '../schema/carts';

// ============================================
// TYPES
// ============================================
export type CartWithItems = Cart & {
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: string;
      stock: number;
      image: string | null;
    } | null;
    variant: {
      id: string;
      name: string;
      sku: string;
      price: string;
      stock: number;
    } | null;
  }>;
  totals: {
    subtotal: string;
    itemCount: number;
  };
};

// ============================================
// QUERIES
// ============================================

/**
 * Get cart by ID with all items and products
 */
export async function getCartById(db: Database, id: string): Promise<CartWithItems | null> {
  const cart = await db.query.carts.findFirst({
    where: eq(carts.id, id),
    with: {
      items: {
        with: {
          product: {
            with: {
              images: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) return null;

  return formatCartWithTotals(cart);
}

/**
 * Get cart by user ID
 */
export async function getCartByUserId(db: Database, userId: string): Promise<CartWithItems | null> {
  const cart = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
    with: {
      items: {
        with: {
          product: {
            with: {
              images: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) return null;

  return formatCartWithTotals(cart);
}

/**
 * Get cart by visitor ID (guest cart)
 */
export async function getCartByVisitorId(
  db: Database,
  visitorId: string
): Promise<CartWithItems | null> {
  const cart = await db.query.carts.findFirst({
    where: eq(carts.visitorId, visitorId),
    with: {
      items: {
        with: {
          product: {
            with: {
              images: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) return null;

  return formatCartWithTotals(cart);
}

/**
 * Get or create cart for user
 */
export async function getOrCreateUserCart(db: Database, userId: string): Promise<Cart> {
  const existing = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
  });

  if (existing) return existing;

  const result = await db.insert(carts).values({ userId }).returning();
  return result[0]!;
}

/**
 * Get or create cart for visitor
 */
export async function getOrCreateVisitorCart(db: Database, visitorId: string): Promise<Cart> {
  const existing = await db.query.carts.findFirst({
    where: eq(carts.visitorId, visitorId),
  });

  if (existing) return existing;

  // Set expiration for guest carts (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const result = await db.insert(carts).values({ visitorId, expiresAt }).returning();
  return result[0]!;
}

/**
 * Create a new cart
 */
export async function createCart(db: Database, data: NewCart) {
  const result = await db.insert(carts).values(data).returning();
  return result[0];
}

/**
 * Add item to cart
 */
export async function addCartItem(
  db: Database,
  cartId: string,
  item: { productId: string; variantId?: string; bundleId?: string; quantity: number }
) {
  // Check if item already exists in cart
  const conditions = [eq(cartItems.cartId, cartId)];

  if (item.productId) {
    conditions.push(eq(cartItems.productId, item.productId));
  }
  if (item.variantId) {
    conditions.push(eq(cartItems.variantId, item.variantId));
  }

  const existing = await db.query.cartItems.findFirst({
    where: and(...conditions),
  });

  if (existing) {
    // Update quantity
    const result = await db
      .update(cartItems)
      .set({ quantity: existing.quantity + item.quantity })
      .where(eq(cartItems.id, existing.id))
      .returning();
    return result[0];
  }

  // Insert new item
  const result = await db
    .insert(cartItems)
    .values({
      cartId,
      productId: item.productId,
      variantId: item.variantId,
      bundleId: item.bundleId,
      quantity: item.quantity,
    })
    .returning();

  // Update cart's updatedAt
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));

  return result[0];
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(db: Database, itemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeCartItem(db, itemId);
  }

  const result = await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, itemId))
    .returning();

  if (result[0]) {
    await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, result[0].cartId));
  }

  return result[0];
}

/**
 * Remove item from cart
 */
export async function removeCartItem(db: Database, itemId: string) {
  const item = await db.query.cartItems.findFirst({
    where: eq(cartItems.id, itemId),
  });

  if (item) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, item.cartId));
  }

  return item;
}

/**
 * Clear all items from cart
 */
export async function clearCart(db: Database, cartId: string) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

/**
 * Delete cart and all items
 */
export async function deleteCart(db: Database, cartId: string) {
  const result = await db.delete(carts).where(eq(carts.id, cartId)).returning();
  return result[0];
}

/**
 * Apply coupon to cart
 */
export async function applyCouponToCart(db: Database, cartId: string, couponCode: string) {
  const result = await db
    .update(carts)
    .set({ couponCode, updatedAt: new Date() })
    .where(eq(carts.id, cartId))
    .returning();

  return result[0];
}

/**
 * Remove coupon from cart
 */
export async function removeCouponFromCart(db: Database, cartId: string) {
  const result = await db
    .update(carts)
    .set({ couponCode: null, updatedAt: new Date() })
    .where(eq(carts.id, cartId))
    .returning();

  return result[0];
}

/**
 * Merge guest cart into user cart
 */
export async function mergeGuestCart(db: Database, visitorId: string, userId: string) {
  const guestCart = await getCartByVisitorId(db, visitorId);
  if (!guestCart || guestCart.items.length === 0) return null;

  const userCart = await getOrCreateUserCart(db, userId);

  // Move items from guest cart to user cart
  for (const item of guestCart.items) {
    if (item.product) {
      await addCartItem(db, userCart.id, {
        productId: item.product.id,
        variantId: item.variant?.id,
        quantity: item.quantity,
      });
    }
  }

  // Delete guest cart
  await deleteCart(db, guestCart.id);

  return getCartById(db, userCart.id);
}

/**
 * Clean up expired guest carts
 */
export async function cleanupExpiredCarts(db: Database) {
  const result = await db.delete(carts).where(lt(carts.expiresAt, new Date())).returning();

  return result.length;
}

/**
 * Get cart item count
 */
export async function getCartItemCount(db: Database, cartId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COALESCE(SUM(quantity), 0)` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));

  return Number(result[0]?.count ?? 0);
}

// ============================================
// HELPERS
// ============================================

function formatCartWithTotals(cart: {
  id: string;
  userId: string | null;
  visitorId: string | null;
  couponCode: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: string;
      stock: number;
      images: Array<{ url: string; isPrimary: boolean }>;
    } | null;
    variant: {
      id: string;
      name: string;
      sku: string;
      price: string;
      stock: number;
    } | null;
  }>;
}): CartWithItems {
  let subtotal = 0;
  let itemCount = 0;

  const items = cart.items.map((item) => {
    const price = item.variant?.price ?? item.product?.price ?? '0';
    subtotal += Number.parseFloat(price) * item.quantity;
    itemCount += item.quantity;

    const primaryImage = item.product?.images.find((img) => img.isPrimary);
    const image = primaryImage?.url ?? item.product?.images[0]?.url ?? null;

    return {
      id: item.id,
      quantity: item.quantity,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: item.product.price,
            stock: item.product.stock,
            image,
          }
        : null,
      variant: item.variant
        ? {
            id: item.variant.id,
            name: item.variant.name,
            sku: item.variant.sku,
            price: item.variant.price,
            stock: item.variant.stock,
          }
        : null,
    };
  });

  return {
    ...cart,
    items,
    totals: {
      subtotal: subtotal.toFixed(2),
      itemCount,
    },
  };
}
