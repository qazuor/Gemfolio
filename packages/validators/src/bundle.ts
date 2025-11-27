import { z } from 'zod';

// Bundle status enum
export const bundleStatusSchema = z.enum(['draft', 'active', 'archived']);
export type BundleStatus = z.infer<typeof bundleStatusSchema>;

// Bundle item schema
export const bundleItemSchema = z.object({
  productId: z.string().min(1, 'Producto es requerido'),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1, 'Cantidad debe ser al menos 1').default(1),
});

export type BundleItem = z.infer<typeof bundleItemSchema>;

// Create bundle schema
export const createBundleSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255),
  slug: z
    .string()
    .min(1, 'Slug es requerido')
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe ser lowercase con guiones'),
  description: z.string().optional(),
  image: z.string().url('URL de imagen inválida').nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido'),
  comparePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido')
    .nullable()
    .optional(),
  status: bundleStatusSchema.default('draft'),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  items: z.array(bundleItemSchema).min(2, 'Un bundle debe tener al menos 2 productos'),
});

export type CreateBundle = z.infer<typeof createBundleSchema>;

// Update bundle schema
export const updateBundleSchema = createBundleSchema.partial();

export type UpdateBundle = z.infer<typeof updateBundleSchema>;

// Bundle filters
export const bundleFiltersSchema = z.object({
  status: bundleStatusSchema.optional(),
  validNow: z.boolean().optional(),
  search: z.string().optional(),
});

export type BundleFilters = z.infer<typeof bundleFiltersSchema>;
