import { db } from '@gemfolio/db';
import { getLowStockCount, getLowStockItems, getOrderStats, getOrders } from '@gemfolio/db/queries';
import { products } from '@gemfolio/db/schema';
import { count, eq } from 'drizzle-orm';
import { Hono } from 'hono';

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
   * GET /admin/dashboard/sales-chart - Get sales data for chart (last 7 days)
   */
  .get('/sales-chart', async (c) => {
    try {
      const days = 7;
      const data: Array<{ date: string; orders: number; revenue: string }> = [];

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

      return success(c, data);
    } catch (err) {
      console.error('Error fetching sales chart:', err);
      return errors.serverError(c);
    }
  });
