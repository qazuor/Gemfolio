import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gemfolio/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Package, ShoppingBag } from 'lucide-react';

import { PageHeader } from '@/components/shared';
import { useCustomerOrders } from '@/hooks/use-customer-orders';

export const Route = createFileRoute('/_dashboard/mi-cuenta/pedidos')({
  component: CustomerOrdersPage,
});

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  refunded: 'outline',
};

function CustomerOrdersPage() {
  const { data: orders, isLoading } = useCustomerOrders();

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mis Pedidos" description="Consulta el historial y estado de tus pedidos" />

      {orders && orders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Historial de Pedidos
            </CardTitle>
            <CardDescription>
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status] || 'secondary'}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.itemCount} producto{order.itemCount !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to="/mi-cuenta/pedidos/$id"
                        params={{ id: order.id }}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalle
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No tienes pedidos</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-2">
              Cuando realices tu primera compra, aparecerá aquí.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
