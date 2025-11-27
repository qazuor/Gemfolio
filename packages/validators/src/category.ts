import { z } from 'zod';

// Category status enum
export const categoryStatusSchema = z.enum(['active', 'inactive']);
export type CategoryStatus = z.infer<typeof categoryStatusSchema>;

// Create category schema
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255),
  slug: z
    .string()
    .min(1, 'Slug es requerido')
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe ser lowercase con guiones'),
  description: z.string().optional(),
  image: z.string().url('URL de imagen inválida').nullable().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().int().min(0).default(0),
  status: categoryStatusSchema.default('active'),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

export type CreateCategory = z.infer<typeof createCategorySchema>;

// Update category schema (all fields optional)
export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategory = z.infer<typeof updateCategorySchema>;

// Reorder categories schema
export const reorderCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
      parentId: z.string().nullable().optional(),
    })
  ),
});

export type ReorderCategories = z.infer<typeof reorderCategoriesSchema>;

// Category with attributes schema (for attribute management)
export const categoryAttributesSchema = z.object({
  categoryId: z.string(),
  attributeIds: z.array(z.string()),
});

export type CategoryAttributes = z.infer<typeof categoryAttributesSchema>;
