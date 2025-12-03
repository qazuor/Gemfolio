import { Badge, Card, CardContent, CardHeader, CardTitle, Separator, Skeleton } from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Package } from 'lucide-react';

import { useOrder } from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/pedidos/$id/productos')({
  component: OrderProductosPage,
});

function OrderProductosPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);

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

  const items = order.items || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Productos del pedido ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay productos en este pedido</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id}>
                <div className="flex gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-lg bg-muted flex-shrink-0">
                    {item.snapshot.image ? (
                      <img
                        src={item.snapshot.image}
                        alt={item.snapshot.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.snapshot.productName}</h4>
                    {item.snapshot.variantName && (
                      <p className="text-sm text-muted-foreground">{item.snapshot.variantName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">SKU: {item.snapshot.sku}</p>
                    {item.snapshot.attributes &&
                      Object.keys(item.snapshot.attributes).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(item.snapshot.attributes).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="my-4" />}
              </div>
            ))}

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm">
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
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
