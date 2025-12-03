import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { CreditCard, Mail, MapPin, Phone, User } from 'lucide-react';

import { useOrder } from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/pedidos/$id/cliente')({
  component: OrderClientePage,
});

function OrderClientePage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informacion del cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">Cliente</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
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
          </div>

          {order.customerNotes && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Notas del cliente</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {order.customerNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Direccion de envio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <address className="not-italic space-y-1">
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-muted-foreground">{order.shippingAddress.address}</p>
            <p className="text-muted-foreground">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
            <p className="text-muted-foreground">
              {order.shippingAddress.postalCode} - {order.shippingAddress.country}
            </p>
            {order.shippingAddress.phone && (
              <p className="text-muted-foreground pt-2">
                <Phone className="h-4 w-4 inline mr-1" />
                {order.shippingAddress.phone}
              </p>
            )}
          </address>
        </CardContent>
      </Card>

      {/* Billing Address (if different) */}
      {order.billingAddress && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Direccion de facturacion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <address className="not-italic space-y-1">
              <p className="font-medium">{order.billingAddress.fullName}</p>
              <p className="text-muted-foreground">{order.billingAddress.address}</p>
              <p className="text-muted-foreground">
                {order.billingAddress.city}, {order.billingAddress.state}
              </p>
              <p className="text-muted-foreground">
                {order.billingAddress.postalCode} - {order.billingAddress.country}
              </p>
            </address>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
