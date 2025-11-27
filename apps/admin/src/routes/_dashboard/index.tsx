import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

import { formatPrice, formatRelativeDate } from '@/lib/utils';

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardPage,
});

const stats = [
  {
    name: 'Pedidos hoy',
    value: '12',
    icon: ShoppingCart,
    change: '+2 desde ayer',
    changeType: 'positive',
  },
  {
    name: 'Ventas hoy',
    value: formatPrice(45231),
    icon: DollarSign,
    change: '+15% desde ayer',
    changeType: 'positive',
  },
  {
    name: 'Productos activos',
    value: '234',
    icon: Package,
    change: '12 sin stock',
    changeType: 'warning',
  },
  {
    name: 'Clientes',
    value: '1,429',
    icon: Users,
    change: '+48 este mes',
    changeType: 'positive',
  },
];

const recentOrders = [
  {
    id: '1',
    orderNumber: 'GEM-2412-A1B2',
    customer: 'María García',
    total: 15200,
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    orderNumber: 'GEM-2412-C3D4',
    customer: 'Juan Pérez',
    total: 8500,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    orderNumber: 'GEM-2412-E5F6',
    customer: 'Ana López',
    total: 32000,
    status: 'processing',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '4',
    orderNumber: 'GEM-2412-G7H8',
    customer: 'Carlos Ruiz',
    total: 12800,
    status: 'shipped',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '5',
    orderNumber: 'GEM-2412-I9J0',
    customer: 'Laura Martínez',
    total: 5600,
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

const lowStockProducts = [
  { id: '1', name: 'Anillo Solitario Diamante', sku: 'ANI-001', stock: 2, threshold: 5 },
  { id: '2', name: 'Collar Perlas Naturales', sku: 'COL-023', stock: 1, threshold: 3 },
  { id: '3', name: 'Pulsera Oro 18k', sku: 'PUL-045', stock: 0, threshold: 5 },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu tienda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.name}</span>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <p
                className={`mt-1 text-xs ${
                  stat.changeType === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : stat.changeType === 'warning'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-muted-foreground'
                }`}
              >
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Pedidos Recientes</h2>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(order.total)}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Alertas de Stock Bajo</h2>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {lowStockProducts.length}
            </span>
          </div>
          <div className="divide-y">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      product.stock === 0
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${product.stock === 0 ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'}`}
                  >
                    {product.stock === 0 ? 'Sin stock' : `${product.stock} unidades`}
                  </p>
                  <p className="text-xs text-muted-foreground">Mínimo: {product.threshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
