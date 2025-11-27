import { z } from 'zod';

// Product status enum
export const productStatusSchema = z.enum(['draft', 'active', 'archived']);
export type ProductStatus = z.infer<typeof productStatusSchema>;

// Product variant schema
export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, 'SKU es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido'),
  comparePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido')
    .nullable()
    .optional(),
  stock: z.number().int().min(0, 'Stock debe ser positivo'),
  lowStockThreshold: z.number().int().min(0).default(5),
  attributes: z.record(z.string(), z.string()).default({}),
  image: z.string().url().nullable().optional(),
  isDefault: z.boolean().default(false),
});

export type ProductVariant = z.infer<typeof productVariantSchema>;

// Product image schema
export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url('URL de imagen inválida'),
  alt: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export type ProductImage = z.infer<typeof productImageSchema>;

// Create product schema
export const createProductSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255),
  slug: z
    .string()
    .min(1, 'Slug es requerido')
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe ser lowercase con guiones'),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().min(1, 'Categoría es requerida'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido'),
  comparePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido')
    .nullable()
    .optional(),
  cost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Costo inválido')
    .nullable()
    .optional(),
  sku: z.string().max(100).optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(true),
  hasVariants: z.boolean().default(false),
  status: productStatusSchema.default('draft'),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  variants: z.array(productVariantSchema).optional(),
  images: z.array(productImageSchema).optional(),
  tagIds: z.array(z.string()).optional(),
});

export type CreateProduct = z.infer<typeof createProductSchema>;

// Update product schema (all fields optional)
export const updateProductSchema = createProductSchema.partial();

export type UpdateProduct = z.infer<typeof updateProductSchema>;

// Product filters for querying
export const productFiltersSchema = z.object({
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  status: productStatusSchema.optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  tagId: z.string().optional(),
  tagSlug: z.string().optional(),
  search: z.string().optional(),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;

// Product pagination
export const productPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ProductPagination = z.infer<typeof productPaginationSchema>;

// Reorder images schema
export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string()).min(1),
});

export type ReorderImages = z.infer<typeof reorderImagesSchema>;
