import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { initSentry, sentryMiddleware } from './lib/sentry';
import { generalRateLimiter, searchRateLimiter, webhookRateLimiter } from './middleware/rate-limit';

// Initialize Sentry for error tracking
initSentry();

import { adminAbandonedCartsRoutes } from './routes/admin/abandoned-carts';
import { adminBundlesRoutes } from './routes/admin/bundles';
import { adminCategoriesRoutes } from './routes/admin/categories';
import { adminCouponsRoutes } from './routes/admin/coupons';
import { adminDashboardRoutes } from './routes/admin/dashboard';
import { adminInventoryRoutes } from './routes/admin/inventory';
import { adminOrdersRoutes } from './routes/admin/orders';
import { adminPagesRoutes } from './routes/admin/pages';
import { adminProductsRoutes } from './routes/admin/products';
import { adminProfileRoutes } from './routes/admin/profile';
import { adminReviewsRoutes } from './routes/admin/reviews';
import { adminSettingsRoutes } from './routes/admin/settings';
import { adminUploadRoutes } from './routes/admin/upload';
import { adminUsersRoutes } from './routes/admin/users';
import { bundlesRoutes } from './routes/bundles';
import { cartRoutes } from './routes/cart';
import { categoriesRoutes } from './routes/categories';
import { customerOrdersRoutes } from './routes/customer/orders';
import { customerProfileRoutes } from './routes/customer/profile';
import { customerReviewsRoutes } from './routes/customer/reviews';
import { customerWishlistRoutes } from './routes/customer/wishlist';
import { ordersRoutes } from './routes/orders';
import { pagesRoutes } from './routes/pages';
import { productsRoutes } from './routes/products';
import { reviewsRoutes } from './routes/reviews';
import { searchRoutes } from './routes/search';
import { settingsRoutes } from './routes/settings';
import { mercadopagoWebhookRoutes } from './routes/webhooks/mercadopago';

// Create the main Hono app
const app = new Hono()
  // Global middleware
  .use('*', sentryMiddleware())
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

// Mount public routes with rate limiting
const publicApi = new Hono()
  .use('*', generalRateLimiter)
  .route('/products', productsRoutes)
  .route('/categories', categoriesRoutes)
  .route('/bundles', bundlesRoutes)
  .route('/search', new Hono().use('*', searchRateLimiter).route('/', searchRoutes))
  .route('/cart', cartRoutes)
  .route('/orders', ordersRoutes)
  .route('/pages', pagesRoutes)
  .route('/settings', settingsRoutes)
  .route('/reviews', reviewsRoutes);

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
  .route('/dashboard', adminDashboardRoutes)
  .route('/upload', adminUploadRoutes)
  .route('/profile', adminProfileRoutes)
  .route('/reviews', adminReviewsRoutes)
  .route('/abandoned-carts', adminAbandonedCartsRoutes);

// Mount customer routes (authenticated users)
const customerApi = new Hono()
  .route('/profile', customerProfileRoutes)
  .route('/orders', customerOrdersRoutes)
  .route('/wishlist', customerWishlistRoutes)
  .route('/reviews', customerReviewsRoutes);

// Mount webhook routes with higher rate limit
const webhooksApi = new Hono()
  .use('*', webhookRateLimiter)
  .route('/mercadopago', mercadopagoWebhookRoutes);

// Mount all routes under /api
const api = new Hono()
  .route('/', publicApi)
  .route('/admin', adminApi)
  .route('/customer', customerApi)
  .route('/webhooks', webhooksApi);

// Mount API under base app
app.route('/api', api);

// Health check - basic
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Health check - detailed (for monitoring)
app.get('/health/detailed', async (c) => {
  const checks: Record<string, { status: 'ok' | 'error'; latency?: number; error?: string }> = {};

  // Check database connection
  const dbStart = Date.now();
  try {
    const { db } = await import('@gemfolio/db');
    await db.execute('SELECT 1');
    checks.database = { status: 'ok', latency: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      status: 'error',
      latency: Date.now() - dbStart,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  // Check if email service is configured
  checks.email = {
    status: process.env.RESEND_API_KEY ? 'ok' : 'error',
    error: process.env.RESEND_API_KEY ? undefined : 'RESEND_API_KEY not configured',
  };

  // Check if payment service is configured
  checks.payments = {
    status: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'ok' : 'error',
    error: process.env.MERCADOPAGO_ACCESS_TOKEN
      ? undefined
      : 'MERCADOPAGO_ACCESS_TOKEN not configured',
  };

  // Check if storage is configured
  checks.storage = {
    status: process.env.UPLOADTHING_TOKEN ? 'ok' : 'error',
    error: process.env.UPLOADTHING_TOKEN ? undefined : 'UPLOADTHING_TOKEN not configured',
  };

  const allOk = Object.values(checks).every((check) => check.status === 'ok');

  return c.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      checks,
    },
    allOk ? 200 : 503
  );
});

// Export the app and types
export { app };
export type AppType = typeof app;

export type { ApiResponse } from './lib/response';
// Re-export helpers and middleware for use in apps
export { errors, paginated, success } from './lib/response';
export {
  addBreadcrumb,
  captureException,
  captureMessage,
  initSentry,
  isSentryConfigured,
  sentryMiddleware,
  setUser,
  withSentry,
} from './lib/sentry';
export { adminMiddleware, superAdminMiddleware } from './middleware/admin';
export type { AuthUser } from './middleware/auth';
export { authMiddleware, getUser } from './middleware/auth';
export {
  authRateLimiter,
  generalRateLimiter,
  rateLimiter,
  searchRateLimiter,
  strictRateLimiter,
  webhookRateLimiter,
} from './middleware/rate-limit';
