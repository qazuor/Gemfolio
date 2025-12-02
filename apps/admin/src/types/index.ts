/**
 * Shared types for the admin application
 */

// Re-export database types
export type {
  BrandingSettings,
  Bundle,
  Cart,
  CartItem,
  Category,
  Coupon,
  GeneralSettings,
  NotificationSettings,
  Order,
  OrderItem,
  Page,
  Product,
  ProductImage,
  ProductVariant,
  SeoSettings,
  Session,
  Setting,
  ShippingSettings,
  SocialSettings,
  Tag,
  User,
} from '@gemfolio/db';

// Admin-specific types

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Generic sort parameters
 */
export interface SortParams<T extends string = string> {
  sortBy?: T;
  sortDirection?: SortDirection;
}

/**
 * Filter parameters for products
 */
export interface ProductFilters
  extends PaginationParams,
    SortParams<'name' | 'price' | 'createdAt' | 'stock'> {
  search?: string;
  categoryId?: string;
  status?: 'draft' | 'active' | 'archived';
  hasStock?: boolean;
}

/**
 * Filter parameters for orders
 */
export interface OrderFilters
  extends PaginationParams,
    SortParams<'orderNumber' | 'total' | 'createdAt'> {
  search?: string;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Filter parameters for customers
 */
export interface CustomerFilters
  extends PaginationParams,
    SortParams<'name' | 'email' | 'createdAt'> {
  search?: string;
  role?: 'admin' | 'customer';
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  ordersToday: number;
  ordersYesterday: number;
  salesToday: number;
  salesYesterday: number;
  totalProducts: number;
  lowStockCount: number;
}

/**
 * Form mode for create/edit pages
 */
export type FormMode = 'create' | 'edit';

/**
 * Async operation status
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
