import { z } from 'zod';

// Base schema for pagination
const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

// Products listing
export const productsSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  categoryId: z.string().optional(),
});

export type ProductsSearch = z.infer<typeof productsSearchSchema>;

// Orders listing
export const ordersSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
});

export type OrdersSearch = z.infer<typeof ordersSearchSchema>;

// Customers listing
export const customersSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(['customer', 'admin', 'super_admin']).optional(),
});

export type CustomersSearch = z.infer<typeof customersSearchSchema>;

// Coupons listing
export const couponsSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']).optional(),
});

export type CouponsSearch = z.infer<typeof couponsSearchSchema>;

// Inventory listing
export const inventorySearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  lowStock: z.boolean().optional(),
  categoryId: z.string().optional(),
});

export type InventorySearch = z.infer<typeof inventorySearchSchema>;

// Bundles listing
export const bundlesSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export type BundlesSearch = z.infer<typeof bundlesSearchSchema>;

// Categories listing
export const categoriesSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export type CategoriesSearch = z.infer<typeof categoriesSearchSchema>;

// Pages listing
export const pagesSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export type PagesSearch = z.infer<typeof pagesSearchSchema>;
