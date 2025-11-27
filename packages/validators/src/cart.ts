import { z } from 'zod';

// Add item to cart schema
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Producto es requerido'),
  variantId: z.string().optional(),
  bundleId: z.string().optional(),
  quantity: z.number().int().min(1, 'Cantidad debe ser al menos 1').default(1),
});

export type AddToCart = z.infer<typeof addToCartSchema>;

// Update cart item schema
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Cantidad debe ser al menos 1'),
});

export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;

// Apply coupon schema
export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Código de cupón es requerido').max(50),
});

export type ApplyCoupon = z.infer<typeof applyCouponSchema>;

// Get or create cart schema (for user/visitor identification)
export const getCartSchema = z
  .object({
    userId: z.string().optional(),
    visitorId: z.string().optional(),
  })
  .refine((data) => data.userId || data.visitorId, {
    message: 'Se requiere userId o visitorId',
  });

export type GetCart = z.infer<typeof getCartSchema>;

// Merge carts schema (when guest logs in)
export const mergCartsSchema = z.object({
  visitorId: z.string().min(1, 'Visitor ID es requerido'),
  userId: z.string().min(1, 'User ID es requerido'),
});

export type MergeCarts = z.infer<typeof mergCartsSchema>;
