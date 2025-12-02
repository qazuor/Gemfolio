import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

import { PageHeader } from '@/components/shared';
import {
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  useDashboardStats,
  useLowStockItems,
  useRecentOrders,
} from '@/hooks/use-dashboard';

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: recentOrders, isLoading: isLoadingOrders } = useRecentOrders();
  const { data: lowStockItems, isLoading: isLoadingStock } = useLowStockItems();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Resumen de tu tienda" />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pedidos hoy"
          value={stats?.today.orders ?? 0}
          icon={ShoppingCart}
          description={`${stats?.pendingOrders ?? 0} pendientes`}
          isLoading={isLoadingStats}
        />
        <StatsCard
          title="Ventas hoy"
          value={stats ? formatCurrency(stats.today.revenue) : '$0'}
          icon={DollarSign}
          description={`Semana: ${stats ? formatCurrency(stats.week.revenue) : '$0'}`}
          isLoading={isLoadingStats}
        />
        <StatsCard
          title="Productos activos"
          value={stats?.activeProducts ?? 0}
          icon={Package}
          description={`${stats?.lowStockAlerts ?? 0} con stock bajo`}
          isLoading={isLoadingStats}
          variant={stats?.lowStockAlerts ? 'warning' : 'default'}
        />
        <StatsCard
          title="Ventas del mes"
          value={stats ? formatCurrency(stats.month.revenue) : '$0'}
          icon={TrendingUp}
          description={`${stats?.month.orders ?? 0} pedidos`}
          isLoading={isLoadingStats}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pedidos Recientes</CardTitle>
            <Link
              to="/pedidos"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOrders?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No hay pedidos recientes</div>
            ) : (
              <div className="space-y-4">
                {recentOrders?.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    to="/pedidos/$id"
                    params={{ id: order.id }}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.name || order.user?.email || 'Cliente'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Alertas de Stock Bajo</CardTitle>
              {(lowStockItems?.length ?? 0) > 0 && (
                <Badge variant="destructive">{lowStockItems?.length}</Badge>
              )}
            </div>
            <Link
              to="/inventario"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Ver inventario
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingStock ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lowStockItems?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="mx-auto mb-2 h-8 w-8" />
                <p>No hay productos con stock bajo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems?.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          item.stock === 0
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.name !== item.productName ? item.name : item.sku || 'Sin SKU'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          item.stock === 0
                            ? 'text-destructive'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {item.stock === 0 ? 'Sin stock' : `${item.stock} unidades`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mínimo: {item.lowStockThreshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isLoading?: boolean;
  variant?: 'default' | 'warning';
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  variant = 'default',
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="mt-1 h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p
            className={`mt-1 text-xs ${
              variant === 'warning'
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-muted-foreground'
            }`}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
