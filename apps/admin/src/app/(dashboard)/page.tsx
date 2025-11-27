import { AlertTriangle, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

const stats = [
  {
    name: 'Pedidos Hoy',
    value: '12',
    change: '+2 vs ayer',
    changeType: 'positive' as const,
    icon: ShoppingCart,
  },
  {
    name: 'Ventas Hoy',
    value: '$45,231',
    change: '+15%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
  {
    name: 'Productos Activos',
    value: '234',
    change: '8 nuevos',
    changeType: 'neutral' as const,
    icon: Package,
  },
  {
    name: 'Clientes',
    value: '1,429',
    change: '+34 este mes',
    changeType: 'positive' as const,
    icon: Users,
  },
];

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';

const recentOrders: Array<{
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
}> = [
  { id: 'GEM-2501-A1B2', customer: 'María García', total: 12500, status: 'pending' },
  { id: 'GEM-2501-C3D4', customer: 'Juan Pérez', total: 8900, status: 'confirmed' },
  { id: 'GEM-2501-E5F6', customer: 'Ana López', total: 23400, status: 'processing' },
  { id: 'GEM-2501-G7H8', customer: 'Carlos Ruiz', total: 5600, status: 'shipped' },
  { id: 'GEM-2501-I9J0', customer: 'Laura Martín', total: 18750, status: 'delivered' },
];

const lowStockProducts = [
  { name: 'Anillo Oro Rosa 18k', stock: 2, threshold: 5 },
  { name: 'Collar Perlas Naturales', stock: 1, threshold: 3 },
  { name: 'Pulsera Plata 925', stock: 3, threshold: 5 },
];

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  shipped: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta. Aquí está el resumen de hoy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <span
                className={`text-xs font-medium ${
                  stat.changeType === 'positive'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-muted-foreground'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-heading text-lg font-semibold">Últimos Pedidos</h2>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total.toLocaleString('es-AR')}</p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-4">
            <a href="/pedidos" className="text-sm font-medium text-primary hover:underline">
              Ver todos los pedidos →
            </a>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="font-heading text-lg font-semibold">Alertas de Stock</h2>
          </div>
          <div className="divide-y">
            {lowStockProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Umbral: {product.threshold} unidades
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-destructive">{product.stock}</p>
                  <p className="text-xs text-muted-foreground">en stock</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-4">
            <a href="/inventario" className="text-sm font-medium text-primary hover:underline">
              Ver inventario completo →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
