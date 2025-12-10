import { db } from '@gemfolio/db';
import {
  getAbandonedCartStats,
  getLowStockCount,
  getLowStockItems,
  getMostWishlistedProducts,
  getOrderStats,
  getOrders,
} from '@gemfolio/db/queries';
import { orderItems, orders, products, reviews, wishlists } from '@gemfolio/db/schema';
import { zValidator } from '@hono/zod-validator';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

export const adminDashboardRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/dashboard/stats - Get dashboard statistics
   */
  .get('/stats', async (c) => {
    try {
      // Get date ranges
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(todayStart);
      monthStart.setMonth(monthStart.getMonth() - 1);

      // Get order stats for different periods
      const [todayStats, weekStats, monthStats, allTimeStats] = await Promise.all([
        getOrderStats(db, todayStart, now),
        getOrderStats(db, weekStart, now),
        getOrderStats(db, monthStart, now),
        getOrderStats(db),
      ]);

      // Get active products count
      const [activeProducts] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.status, 'active'));

      // Get low stock count
      const lowStockCount = await getLowStockCount(db);

      return success(c, {
        today: {
          orders: todayStats.totalOrders,
          revenue: todayStats.totalRevenue,
        },
        week: {
          orders: weekStats.totalOrders,
          revenue: weekStats.totalRevenue,
        },
        month: {
          orders: monthStats.totalOrders,
          revenue: monthStats.totalRevenue,
        },
        allTime: {
          orders: allTimeStats.totalOrders,
          revenue: allTimeStats.totalRevenue,
        },
        pendingOrders: allTimeStats.pendingOrders,
        processingOrders: allTimeStats.processingOrders,
        activeProducts: activeProducts?.count ?? 0,
        lowStockAlerts: lowStockCount,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/dashboard/recent-orders - Get recent orders
   */
  .get('/recent-orders', async (c) => {
    try {
      const result = await getOrders(db, {}, { page: 1, limit: 10 }, 'desc');

      return success(c, result.items);
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/dashboard/low-stock - Get low stock alerts
   */
  .get('/low-stock', async (c) => {
    try {
      const items = await getLowStockItems(db, 10);

      return success(c, items);
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/dashboard/sales-chart - Get sales data for chart
   */
  .get(
    '/sales-chart',
    zValidator(
      'query',
      z.object({
        period: z.enum(['7d', '30d', '90d', '12m']).default('7d'),
      })
    ),
    async (c) => {
      const { period } = c.req.valid('query');

      try {
        const data: Array<{ date: string; orders: number; revenue: string }> = [];

        let days: number;
        let groupBy: 'day' | 'week' | 'month' = 'day';

        switch (period) {
          case '7d':
            days = 7;
            groupBy = 'day';
            break;
          case '30d':
            days = 30;
            groupBy = 'day';
            break;
          case '90d':
            days = 90;
            groupBy = 'week';
            break;
          case '12m':
            days = 365;
            groupBy = 'month';
            break;
        }

        if (groupBy === 'day') {
          for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);

            const stats = await getOrderStats(db, startOfDay, endOfDay);

            data.push({
              date: startOfDay.toISOString().split('T')[0],
              orders: stats.totalOrders,
              revenue: stats.totalRevenue,
            });
          }
        } else if (groupBy === 'week') {
          const weeks = Math.ceil(days / 7);
          for (let i = weeks - 1; i >= 0; i--) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - i * 7);
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 7);

            const stats = await getOrderStats(db, startDate, endDate);

            data.push({
              date: startDate.toISOString().split('T')[0],
              orders: stats.totalOrders,
              revenue: stats.totalRevenue,
            });
          }
        } else if (groupBy === 'month') {
          for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const stats = await getOrderStats(db, startOfMonth, endOfMonth);

            data.push({
              date: `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}`,
              orders: stats.totalOrders,
              revenue: stats.totalRevenue,
            });
          }
        }

        return success(c, data);
      } catch (err) {
        console.error('Error fetching sales chart:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * GET /admin/dashboard/top-products - Get top selling products
   */
  .get(
    '/top-products',
    zValidator(
      'query',
      z.object({
        limit: z.coerce.number().min(1).max(20).default(10),
        period: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
      })
    ),
    async (c) => {
      const { limit, period } = c.req.valid('query');

      try {
        let startDate: Date | undefined;
        if (period !== 'all') {
          startDate = new Date();
          const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
          startDate.setDate(startDate.getDate() - days);
        }

        const conditions = [eq(orders.paymentStatus, 'paid')];
        if (startDate) {
          conditions.push(gte(orders.createdAt, startDate));
        }

        const topProducts = await db
          .select({
            productId: orderItems.snapshot,
            totalQuantity: sql<number>`SUM(${orderItems.quantity})`,
            totalRevenue: sql<string>`SUM(${orderItems.totalPrice}::numeric)`,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(and(...conditions))
          .groupBy(orderItems.snapshot)
          .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
          .limit(limit);

        const result = topProducts.map((item) => ({
          productId: (item.productId as { productId?: string })?.productId,
          productName: (item.productId as { productName?: string })?.productName,
          image: (item.productId as { image?: string })?.image,
          totalQuantity: Number(item.totalQuantity),
          totalRevenue: item.totalRevenue,
        }));

        return success(c, result);
      } catch (err) {
        console.error('Error fetching top products:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * GET /admin/dashboard/order-status-breakdown - Get order status distribution
   */
  .get('/order-status-breakdown', async (c) => {
    try {
      const breakdown = await db
        .select({
          status: orders.status,
          count: sql<number>`count(*)`,
        })
        .from(orders)
        .groupBy(orders.status);

      const result: Record<string, number> = {};
      for (const item of breakdown) {
        result[item.status] = Number(item.count);
      }

      return success(c, result);
    } catch (err) {
      console.error('Error fetching order status breakdown:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/dashboard/payment-status-breakdown - Get payment status distribution
   */
  .get('/payment-status-breakdown', async (c) => {
    try {
      const breakdown = await db
        .select({
          status: orders.paymentStatus,
          count: sql<number>`count(*)`,
        })
        .from(orders)
        .groupBy(orders.paymentStatus);

      const result: Record<string, number> = {};
      for (const item of breakdown) {
        result[item.status] = Number(item.count);
      }

      return success(c, result);
    } catch (err) {
      console.error('Error fetching payment status breakdown:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/dashboard/revenue-comparison - Compare revenue across periods
   */
  .get('/revenue-comparison', async (c) => {
    try {
      const now = new Date();

      // Current month
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthStats = await getOrderStats(db, currentMonthStart, now);

      // Last month
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const lastMonthStats = await getOrderStats(db, lastMonthStart, lastMonthEnd);

      // Calculate growth
      const currentRevenue = Number(currentMonthStats.totalRevenue);
      const lastRevenue = Number(lastMonthStats.totalRevenue);
      const revenueGrowth =
        lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      const currentOrders = currentMonthStats.totalOrders;
      const lastOrders = lastMonthStats.totalOrders;
      const ordersGrowth = lastOrders > 0 ? ((currentOrders - lastOrders) / lastOrders) * 100 : 0;

      return success(c, {
        currentMonth: {
          revenue: currentMonthStats.totalRevenue,
          orders: currentMonthStats.totalOrders,
        },
        lastMonth: {
          revenue: lastMonthStats.totalRevenue,
          orders: lastMonthStats.totalOrders,
        },
        growth: {
          revenue: revenueGrowth.toFixed(2),
          orders: ordersGrowth.toFixed(2),
        },
      });
    } catch (err) {
      console.error('Error fetching revenue comparison:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/dashboard/abandoned-cart-stats - Get abandoned cart statistics
   */
  .get('/abandoned-cart-stats', async (c) => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const stats = await getAbandonedCartStats(db, {
        startDate: thirtyDaysAgo,
        endDate: now,
      });

      return success(c, stats);
    } catch (err) {
      console.error('Error fetching abandoned cart stats:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/dashboard/review-stats - Get review statistics
   */
  .get('/review-stats', async (c) => {
    try {
      const [totalReviews] = await db.select({ count: count() }).from(reviews);

      const [pendingReviews] = await db
        .select({ count: count() })
        .from(reviews)
        .where(eq(reviews.status, 'pending'));

      const [averageRating] = await db
        .select({
          avg: sql<number>`COALESCE(AVG(rating), 0)`,
        })
        .from(reviews)
        .where(eq(reviews.status, 'approved'));

      const ratingDistribution = await db
        .select({
          rating: reviews.rating,
          count: sql<number>`count(*)`,
        })
        .from(reviews)
        .where(eq(reviews.status, 'approved'))
        .groupBy(reviews.rating);

      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const item of ratingDistribution) {
        distribution[item.rating] = Number(item.count);
      }

      return success(c, {
        totalReviews: totalReviews?.count ?? 0,
        pendingReviews: pendingReviews?.count ?? 0,
        averageRating: Number(averageRating?.avg ?? 0).toFixed(2),
        ratingDistribution: distribution,
      });
    } catch (err) {
      console.error('Error fetching review stats:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/dashboard/wishlist-stats - Get wishlist statistics
   */
  .get('/wishlist-stats', async (c) => {
    try {
      // Total wishlisted items
      const [totalWishlisted] = await db.select({ count: count() }).from(wishlists);

      // Unique users with wishlists
      const [uniqueUsers] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${wishlists.userId})` })
        .from(wishlists);

      // Unique products wishlisted
      const [uniqueProducts] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${wishlists.productId})` })
        .from(wishlists);

      // Most wishlisted products with product info
      const mostWishlisted = await getMostWishlistedProducts(db, 10);

      // Get product details for most wishlisted
      const productIds = mostWishlisted.map((p) => p.productId);
      const productDetails =
        productIds.length > 0
          ? await db.query.products.findMany({
              where: sql`${products.id} IN ${productIds}`,
              columns: {
                id: true,
                name: true,
                slug: true,
                price: true,
              },
              with: {
                images: {
                  columns: { url: true, isPrimary: true },
                  orderBy: (images, { asc }) => [asc(images.order)],
                  limit: 1,
                },
              },
            })
          : [];

      const mostWishlistedWithDetails = mostWishlisted.map((item) => {
        const product = productDetails.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          count: item.count,
          productName: product?.name ?? 'Producto eliminado',
          productSlug: product?.slug ?? '',
          productPrice: product?.price ?? '0',
          productImage: product?.images?.[0]?.url ?? null,
        };
      });

      return success(c, {
        totalWishlisted: totalWishlisted?.count ?? 0,
        uniqueUsers: Number(uniqueUsers?.count ?? 0),
        uniqueProducts: Number(uniqueProducts?.count ?? 0),
        mostWishlisted: mostWishlistedWithDetails,
      });
    } catch (err) {
      console.error('Error fetching wishlist stats:', err);
      return errors.serverError(c);
    }
  });
