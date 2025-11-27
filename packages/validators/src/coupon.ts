import { z } from 'zod';

// Coupon type enum
export const couponTypeSchema = z.enum(['percentage', 'fixed', 'free_shipping']);
export type CouponType = z.infer<typeof couponTypeSchema>;

// Base coupon schema (without refinement)
const baseCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Código debe tener al menos 3 caracteres')
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, 'Código debe ser mayúsculas, números, guiones o guiones bajos'),
  description: z.string().max(500).optional(),
  type: couponTypeSchema,
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido'),
  minPurchase: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto mínimo inválido')
    .nullable()
    .optional(),
  maxDiscount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Descuento máximo inválido')
    .nullable()
    .optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  usageCount: z.number().int().min(0).default(0),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

// Create coupon schema with percentage validation
export const createCouponSchema = baseCouponSchema.refine(
  (data) => {
    if (data.type === 'percentage') {
      const value = Number.parseFloat(data.value);
      return value > 0 && value <= 100;
    }
    return true;
  },
  {
    message: 'El porcentaje debe estar entre 1 y 100',
    path: ['value'],
  }
);

export type CreateCoupon = z.infer<typeof createCouponSchema>;

// Update coupon schema (partial of base, without refinement for partial updates)
export const updateCouponSchema = baseCouponSchema.partial();

export type UpdateCoupon = z.infer<typeof updateCouponSchema>;

// Validate coupon schema (for checkout)
export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  cartTotal: z.number().min(0, 'Total debe ser positivo'),
});

export type ValidateCoupon = z.infer<typeof validateCouponSchema>;

// Coupon filters
export const couponFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  type: couponTypeSchema.optional(),
  search: z.string().optional(),
  validNow: z.boolean().optional(),
});

export type CouponFilters = z.infer<typeof couponFiltersSchema>;
