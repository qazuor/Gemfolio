import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
} from '@gemfolio/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  MousePointer,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/shared';
import {
  getStatusColor,
  getStatusLabel,
  useAbandonedCart,
  useDeleteAbandonedCart,
  useSendRecoveryEmail,
  useUpdateAbandonedCart,
} from '@/hooks/use-abandoned-carts';

export const Route = createFileRoute('/_dashboard/carritos-abandonados/$id')({
  component: AbandonedCartDetailPage,
});

function AbandonedCartDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: cart, isLoading, error } = useAbandonedCart(id);
  const sendRecovery = useSendRecoveryEmail();
  const updateCart = useUpdateAbandonedCart();
  const deleteCart = useDeleteAbandonedCart();

  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  const handleSendRecovery = () => {
    sendRecovery.mutate(id);
  };

  const handleUpdateDiscount = () => {
    updateCart.mutate({
      id,
      discountCode: discountCode || undefined,
      discountPercent: discountPercent ? Number.parseInt(discountPercent, 10) : undefined,
    });
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      deleteCart.mutate(id, {
        onSuccess: () => navigate({ to: '/carritos-abandonados' }),
      });
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(value));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró el carrito</p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/carritos-abandonados">Volver a carritos</Link>
        </Button>
      </div>
    );
  }

  const email = cart.user?.email || cart.customerEmail;
  const canSendEmail =
    email && !cart.isRecovered && cart.status !== 'expired' && cart.status !== 'unsubscribed';

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/carritos-abandonados">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a carritos
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Detalle del Carrito Abandonado"
        description={`Abandonado ${formatDistanceToNow(new Date(cart.abandonedAt), {
          addSuffix: true,
          locale: es,
        })}`}
      >
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(cart.status)}>{getStatusLabel(cart.status)}</Badge>
          {cart.isRecovered && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Recuperado
            </Badge>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.user ? (
                <div>
                  <p className="font-medium">{cart.user.name || 'Sin nombre'}</p>
                  <p className="text-sm text-muted-foreground">{cart.user.email}</p>
                  <Link
                    to="/clientes/$id"
                    params={{ id: cart.user.id }}
                    className="text-sm text-primary hover:underline"
                  >
                    Ver perfil del cliente
                  </Link>
                </div>
              ) : cart.customerEmail ? (
                <div>
                  <p className="font-medium">Cliente no registrado</p>
                  <p className="text-sm text-muted-foreground">{cart.customerEmail}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Sin información de contacto</p>
              )}
            </CardContent>
          </Card>

          {/* Cart Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumen del carrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-4 border-b">
                <span className="text-muted-foreground">Total del carrito</span>
                <span className="text-2xl font-bold">{formatCurrency(cart.cartTotal)}</span>
              </div>
              {cart.cartItems ? (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Productos en el carrito:</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                    {JSON.stringify(cart.cartItems, null, 2)}
                  </pre>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Email Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Historial de comunicaciones
              </CardTitle>
              <CardDescription>{cart.recoveryAttempts} intentos de recuperación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Carrito abandonado</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(cart.abandonedAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>

                {cart.recoveryEmailSentAt && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Email de recuperación enviado</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(cart.recoveryEmailSentAt),
                          "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {cart.emailOpenedAt && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Email abierto</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(cart.emailOpenedAt),
                          "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          {
                            locale: es,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {cart.emailClickedAt && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <MousePointer className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Click en el email</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(cart.emailClickedAt),
                          "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {cart.followUpEmailSentAt && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Email de seguimiento enviado</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(cart.followUpEmailSentAt),
                          "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {cart.recoveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Carrito recuperado</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(cart.recoveredAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                          locale: es,
                        })}
                      </p>
                      {cart.recoveredOrderId && (
                        <Link
                          to="/pedidos/$id"
                          params={{ id: cart.recoveredOrderId }}
                          className="text-sm text-primary hover:underline"
                        >
                          Ver pedido
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canSendEmail && (
                <Button
                  className="w-full"
                  onClick={handleSendRecovery}
                  disabled={sendRecovery.isPending}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {sendRecovery.isPending ? 'Enviando...' : 'Enviar email de recuperación'}
                </Button>
              )}
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleteCart.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteCart.isPending ? 'Eliminando...' : 'Eliminar registro'}
              </Button>
            </CardContent>
          </Card>

          {/* Discount */}
          {!cart.isRecovered && cart.status !== 'expired' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurar descuento</CardTitle>
                <CardDescription>
                  Ofrece un descuento para incentivar la recuperación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discountCode">Código de descuento</Label>
                  <Input
                    id="discountCode"
                    placeholder="RECUPERA10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    defaultValue={cart.discountCode ?? ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Porcentaje (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    defaultValue={cart.discountPercent?.toString() ?? ''}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleUpdateDiscount}
                  disabled={updateCart.isPending}
                >
                  {updateCart.isPending ? 'Guardando...' : 'Guardar descuento'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Discount */}
          {(cart.discountCode || cart.discountPercent) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Descuento configurado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cart.discountCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código:</span>
                    <span className="font-mono">{cart.discountCode}</span>
                  </div>
                )}
                {cart.discountPercent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descuento:</span>
                    <span>{cart.discountPercent}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{cart.id.slice(0, 8)}...</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creado:</span>
                <span>{format(new Date(cart.createdAt), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actualizado:</span>
                <span>{format(new Date(cart.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
