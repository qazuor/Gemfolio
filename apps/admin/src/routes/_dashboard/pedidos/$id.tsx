import { Button, Skeleton } from '@gemfolio/ui';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Package,
  Printer,
  RefreshCw,
  ShoppingBag,
  User,
} from 'lucide-react';

import { PageHeader } from '@/components/shared';
import { useOrder } from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/pedidos/$id')({
  component: OrderLayout,
});

const tabs = [
  { path: 'resumen', label: 'Resumen', icon: ShoppingBag },
  { path: 'productos', label: 'Productos', icon: Package },
  { path: 'cliente', label: 'Cliente', icon: User },
  { path: 'pagos', label: 'Pagos', icon: CreditCard },
  { path: 'historial', label: 'Historial', icon: Clock },
];

function OrderLayout() {
  const { id } = Route.useParams();
  const location = useLocation();
  const { data: order, isLoading, refetch } = useOrder(id);

  if (isLoading) {
    return <OrderLayoutSkeleton />;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Pedido no encontrado</h2>
        <p className="text-muted-foreground">El pedido que buscas no existe</p>
        <Button asChild className="mt-4">
          <Link to="/pedidos">Volver a pedidos</Link>
        </Button>
      </div>
    );
  }

  const currentTab = location.pathname.split('/').pop() || 'resumen';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/pedidos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={`Pedido #${order.orderNumber}`}
          description={format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
            locale: es,
          })}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
          }
        />
      </div>

      {/* Tab Navigation */}
      <nav className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={`/pedidos/$id/${tab.path}` as '/pedidos/$id/resumen'}
              params={{ id }}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Child Route Content */}
      <Outlet />
    </div>
  );
}

function OrderLayoutSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
