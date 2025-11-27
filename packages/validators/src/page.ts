import { z } from 'zod';

// Page status enum
export const pageStatusSchema = z.enum(['draft', 'published']);
export type PageStatus = z.infer<typeof pageStatusSchema>;

// Create page schema
export const createPageSchema = z.object({
  title: z.string().min(1, 'Título es requerido').max(255),
  slug: z
    .string()
    .min(1, 'Slug es requerido')
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe ser lowercase con guiones'),
  content: z.string().min(1, 'Contenido es requerido'),
  status: pageStatusSchema.default('draft'),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

export type CreatePage = z.infer<typeof createPageSchema>;

// Update page schema
export const updatePageSchema = createPageSchema.partial();

export type UpdatePage = z.infer<typeof updatePageSchema>;

// Page filters
export const pageFiltersSchema = z.object({
  status: pageStatusSchema.optional(),
  search: z.string().optional(),
});

export type PageFilters = z.infer<typeof pageFiltersSchema>;
