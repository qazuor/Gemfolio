import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { adminBundlesRoutes } from './routes/admin/bundles';
import { adminCategoriesRoutes } from './routes/admin/categories';
import { adminCouponsRoutes } from './routes/admin/coupons';
import { adminDashboardRoutes } from './routes/admin/dashboard';
import { adminInventoryRoutes } from './routes/admin/inventory';
import { adminOrdersRoutes } from './routes/admin/orders';
import { adminPagesRoutes } from './routes/admin/pages';
import { adminProductsRoutes } from './routes/admin/products';
import { adminSettingsRoutes } from './routes/admin/settings';
import { adminUsersRoutes } from './routes/admin/users';
import { bundlesRoutes } from './routes/bundles';
import { cartRoutes } from './routes/cart';
import { categoriesRoutes } from './routes/categories';
import { ordersRoutes } from './routes/orders';
import { pagesRoutes } from './routes/pages';
import { productsRoutes } from './routes/products';
import { searchRoutes } from './routes/search';
import { settingsRoutes } from './routes/settings';

// Create the main Hono app
const app = new Hono()
  // Global middleware
  .use('*', logger())
  .use(
    '*',
    cors({
      origin: (origin) => {
        // Allow requests from configured origins
        const allowedOrigins = [
          'http://localhost:3001', // Admin
          'http://localhost:4321', // Web
        ];
        if (allowedOrigins.includes(origin)) {
          return origin;
        }
        return allowedOrigins[0];
      },
      credentials: true,
    })
  );

// Mount public routes
const publicApi = new Hono()
  .route('/products', productsRoutes)
  .route('/categories', categoriesRoutes)
  .route('/bundles', bundlesRoutes)
  .route('/search', searchRoutes)
  .route('/cart', cartRoutes)
  .route('/orders', ordersRoutes)
  .route('/pages', pagesRoutes)
  .route('/settings', settingsRoutes);

// Mount admin routes
const adminApi = new Hono()
  .route('/products', adminProductsRoutes)
  .route('/categories', adminCategoriesRoutes)
  .route('/bundles', adminBundlesRoutes)
  .route('/orders', adminOrdersRoutes)
  .route('/inventory', adminInventoryRoutes)
  .route('/coupons', adminCouponsRoutes)
  .route('/users', adminUsersRoutes)
  .route('/pages', adminPagesRoutes)
  .route('/settings', adminSettingsRoutes)
  .route('/dashboard', adminDashboardRoutes);

// Mount all routes under /api
const api = new Hono().route('/', publicApi).route('/admin', adminApi);

// Mount API under base app
app.route('/api', api);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Export the app and types
export { app };
export type AppType = typeof app;

export type { ApiResponse } from './lib/response';
// Re-export helpers and middleware for use in apps
export { errors, paginated, success } from './lib/response';
export { adminMiddleware, superAdminMiddleware } from './middleware/admin';
export type { AuthUser } from './middleware/auth';
export { authMiddleware, getUser } from './middleware/auth';
