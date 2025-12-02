import {
  Badge,
  Button,
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
import { createFileRoute, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  RefreshCw,
  User,
} from 'lucide-react';

import { OrderNotes, OrderStatusSelect } from '@/components/orders';
import { PageHeader } from '@/components/shared';
import {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getStatusColor,
  getStatusLabel,
  useOrder,
  useUpdatePaymentStatus,
} from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/pedidos/$id')({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading, refetch } = useOrder(id);
  const updatePaymentStatus = useUpdatePaymentStatus();

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(value));
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
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

  const handlePaymentStatusChange = (newStatus: string) => {
    updatePaymentStatus.mutate({
      id: order.id,
      paymentStatus: newStatus as 'pending' | 'paid' | 'failed' | 'refunded',
    });
  };

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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1">
                  <p className="mb-1 text-sm text-muted-foreground">Estado</p>
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm text-muted-foreground">Estado de pago</p>
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

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-sm font-medium">Historial de estados</h4>
                    <div className="space-y-2">
                      {order.statusHistory.map((history) => (
                        <div
                          key={history.id}
                          className="flex items-start gap-3 rounded-lg border p-3"
                        >
                          <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(history.status)} className="text-xs">
                                {getStatusLabel(history.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(history.createdAt), "dd MMM yyyy 'a las' HH:mm", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                            {history.note && (
                              <p className="mt-1 text-sm text-muted-foreground">{history.note}</p>
                            )}
                            {history.changedByUser && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Por: {history.changedByUser.name || history.changedByUser.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      {item.snapshot.image ? (
                        <img
                          src={item.snapshot.image}
                          alt={item.snapshot.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.snapshot.productName}</p>
                      {item.snapshot.variantName && (
                        <p className="text-sm text-muted-foreground">{item.snapshot.variantName}</p>
                      )}
                      <p className="text-sm text-muted-foreground">SKU: {item.snapshot.sku}</p>
                      {item.snapshot.attributes && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.snapshot.attributes).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
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
                  <span className="text-muted-foreground">Envío</span>
                  <span>
                    {Number(order.shippingCost) === 0
                      ? 'Gratis'
                      : formatCurrency(order.shippingCost)}
                  </span>
                </div>
                {Number(order.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <OrderNotes
            orderId={order.id}
            customerNotes={order.customerNotes}
            adminNotes={order.adminNotes}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${order.customerEmail}`} className="text-primary hover:underline">
                  {order.customerEmail}
                </a>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline">
                    {order.customerPhone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic text-sm">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p>
                  {order.shippingAddress.postalCode} - {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="mt-2 text-muted-foreground">{order.shippingAddress.phone}</p>
                )}
              </address>
            </CardContent>
          </Card>

          {/* Billing Address (if different) */}
          {order.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Dirección de facturación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-sm">
                  <p className="font-medium">{order.billingAddress.fullName}</p>
                  <p>{order.billingAddress.address}</p>
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state}
                  </p>
                  <p>
                    {order.billingAddress.postalCode} - {order.billingAddress.country}
                  </p>
                </address>
              </CardContent>
            </Card>
          )}

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información del pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número</span>
                <span className="font-medium">#{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última actualización</span>
                <span>{format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-16 w-16" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
