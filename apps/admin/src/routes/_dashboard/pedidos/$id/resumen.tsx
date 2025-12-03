import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';

import { OrderStatusSelect } from '@/components/orders';
import {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  useOrder,
  useUpdatePaymentStatus,
} from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/pedidos/$id/resumen')({
  component: OrderResumenPage,
});

function OrderResumenPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);
  const updatePaymentStatus = useUpdatePaymentStatus();

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(value));
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!order) {
    return null;
  }

  const handlePaymentStatusChange = (newStatus: string) => {
    updatePaymentStatus.mutate({
      id: order.id,
      paymentStatus: newStatus as 'pending' | 'paid' | 'failed' | 'refunded',
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Estado</p>
              <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Estado de pago</p>
              <div className="flex items-center gap-2">
                <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </Badge>
                <Select
                  value={order.paymentStatus}
                  onValueChange={handlePaymentStatusChange}
                  disabled={updatePaymentStatus.isPending}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="failed">Fallido</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Productos ({order.items?.length || 0})</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Descuento
                {order.couponCode && ` (${order.couponCode})`}
              </span>
              <span className="text-green-600">-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envio</span>
            <span>
              {Number(order.shippingCost) === 0 ? 'Gratis' : formatCurrency(order.shippingCost)}
            </span>
          </div>
          {Number(order.tax) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Impuestos</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span className="text-lg">{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Informacion rapida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{order.items?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Productos</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{formatCurrency(order.total)}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{order.statusHistory?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Cambios de estado</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold truncate">{order.customerName.split(' ')[0]}</p>
              <p className="text-sm text-muted-foreground">Cliente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
