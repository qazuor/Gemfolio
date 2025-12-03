import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreditCard, DollarSign } from 'lucide-react';

import {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  useOrder,
  useUpdatePaymentStatus,
} from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/pedidos/$id/pagos')({
  component: OrderPagosPage,
});

function OrderPagosPage() {
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
      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Estado del pago
          </CardTitle>
          <CardDescription>Gestiona el estado del pago del pedido</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Estado actual</p>
              <Badge variant={getPaymentStatusColor(order.paymentStatus)} className="mt-1">
                {getPaymentStatusLabel(order.paymentStatus)}
              </Badge>
            </div>
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

          <div className="text-sm text-muted-foreground">
            <p>
              Ultima actualizacion:{' '}
              {format(new Date(order.updatedAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                locale: es,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Desglose del pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Descuento
                {order.couponCode && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {order.couponCode}
                  </Badge>
                )}
              </span>
              <span className="text-green-600">-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envio</span>
            <span>
              {Number(order.shippingCost) === 0 ? 'Gratis' : formatCurrency(order.shippingCost)}
            </span>
          </div>
          {Number(order.tax) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
          )}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-medium text-lg">
              <span>Total a pagar</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Info */}
      {order.couponCode && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cupon aplicado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Badge variant="secondary" className="text-base">
                  {order.couponCode}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Descuento aplicado: {formatCurrency(order.couponDiscount || order.discount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  -{formatCurrency(order.couponDiscount || order.discount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
