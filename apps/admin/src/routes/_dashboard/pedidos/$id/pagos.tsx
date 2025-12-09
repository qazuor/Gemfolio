import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Check, CreditCard, DollarSign, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

import {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getRefundReasonLabel,
  getRefundStatusColor,
  getRefundStatusLabel,
  type Refund,
  useCreateRefund,
  useOrder,
  useOrderRefunds,
  useUpdatePaymentStatus,
  useUpdateRefundStatus,
} from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/pedidos/$id/pagos')({
  component: OrderPagosPage,
});

type RefundReason =
  | 'customer_request'
  | 'defective_product'
  | 'wrong_item'
  | 'not_as_described'
  | 'damaged_shipping'
  | 'other';

function OrderPagosPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);
  const { data: refundsData, isLoading: isLoadingRefunds } = useOrderRefunds(id);
  const updatePaymentStatus = useUpdatePaymentStatus();
  const createRefund = useCreateRefund(id);
  const updateRefundStatus = useUpdateRefundStatus(id);

  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState<RefundReason>('customer_request');
  const [refundDetails, setRefundDetails] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const handleCreateRefund = () => {
    if (!refundAmount || Number.parseFloat(refundAmount) <= 0) return;

    createRefund.mutate(
      {
        amount: refundAmount,
        reason: refundReason,
        reasonDetails: refundDetails || undefined,
      },
      {
        onSuccess: () => {
          setShowRefundDialog(false);
          setRefundAmount('');
          setRefundReason('customer_request');
          setRefundDetails('');
        },
      }
    );
  };

  const handleApproveRefund = (refund: Refund) => {
    updateRefundStatus.mutate({
      refundId: refund.id,
      status: 'approved',
    });
  };

  const handleProcessRefund = (refund: Refund) => {
    updateRefundStatus.mutate({
      refundId: refund.id,
      status: 'processing',
    });
  };

  const handleCompleteRefund = (refund: Refund) => {
    updateRefundStatus.mutate({
      refundId: refund.id,
      status: 'completed',
    });
  };

  const handleRejectRefund = () => {
    if (!selectedRefund || !rejectionReason) return;

    updateRefundStatus.mutate(
      {
        refundId: selectedRefund.id,
        status: 'rejected',
        rejectionReason,
      },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setSelectedRefund(null);
          setRejectionReason('');
        },
      }
    );
  };

  const openRejectDialog = (refund: Refund) => {
    setSelectedRefund(refund);
    setShowRejectDialog(true);
  };

  const canCreateRefund =
    (order.paymentStatus === 'paid' || order.paymentStatus === 'refunded') &&
    Number.parseFloat(refundsData?.remainingToRefund || order.total) > 0;

  return (
    <div className="space-y-6">
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
            {refundsData && Number.parseFloat(refundsData.refundedAmount) > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Reembolsado</span>
                <span>-{formatCurrency(refundsData.refundedAmount)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coupon Info */}
      {order.couponCode && (
        <Card>
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

      {/* Refunds Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Reembolsos
            </CardTitle>
            <CardDescription>Gestiona los reembolsos del pedido</CardDescription>
          </div>
          {canCreateRefund && (
            <Button onClick={() => setShowRefundDialog(true)}>Crear reembolso</Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingRefunds ? (
            <Skeleton className="h-32 w-full" />
          ) : !refundsData?.refunds.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay reembolsos para este pedido</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Refund Summary */}
              <div className="flex gap-4 p-4 bg-muted rounded-lg text-sm">
                <div>
                  <p className="text-muted-foreground">Total reembolsado</p>
                  <p className="font-semibold">{formatCurrency(refundsData.refundedAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disponible para reembolso</p>
                  <p className="font-semibold">{formatCurrency(refundsData.remainingToRefund)}</p>
                </div>
              </div>

              {/* Refund List */}
              {refundsData.refunds.map((refund) => (
                <div key={refund.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{formatCurrency(refund.amount)}</p>
                        <Badge variant={getRefundStatusColor(refund.status)}>
                          {getRefundStatusLabel(refund.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getRefundReasonLabel(refund.reason)}
                        {refund.reasonDetails && ` - ${refund.reasonDetails}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {refund.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveRefund(refund)}
                            disabled={updateRefundStatus.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(refund)}
                            disabled={updateRefundStatus.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      {refund.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcessRefund(refund)}
                          disabled={updateRefundStatus.isPending}
                        >
                          Procesar
                        </Button>
                      )}
                      {refund.status === 'processing' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteRefund(refund)}
                          disabled={updateRefundStatus.isPending}
                        >
                          Completar
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>
                      Creado:{' '}
                      {format(new Date(refund.createdAt), "dd/MM/yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </p>
                    {refund.processedAt && (
                      <p>
                        Procesado:{' '}
                        {format(new Date(refund.processedAt), "dd/MM/yyyy 'a las' HH:mm", {
                          locale: es,
                        })}
                        {refund.processedByUser &&
                          ` por ${refund.processedByUser.name || refund.processedByUser.email}`}
                      </p>
                    )}
                    {refund.rejectionReason && (
                      <p className="text-destructive mt-1">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Rechazado: {refund.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Crear reembolso</DialogTitle>
            <DialogDescription>
              Monto máximo disponible:{' '}
              {formatCurrency(refundsData?.remainingToRefund || order.total)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a reembolsar</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={refundsData?.remainingToRefund || order.total}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del reembolso</Label>
              <Select
                value={refundReason}
                onValueChange={(v) => setRefundReason(v as RefundReason)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_request">Solicitud del cliente</SelectItem>
                  <SelectItem value="defective_product">Producto defectuoso</SelectItem>
                  <SelectItem value="wrong_item">Artículo incorrecto</SelectItem>
                  <SelectItem value="not_as_described">No como se describió</SelectItem>
                  <SelectItem value="damaged_shipping">Dañado en envío</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Detalles adicionales (opcional)</Label>
              <Textarea
                id="details"
                value={refundDetails}
                onChange={(e) => setRefundDetails(e.target.value)}
                placeholder="Describe el motivo del reembolso..."
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRefund}
              disabled={
                createRefund.isPending ||
                !refundAmount ||
                Number.parseFloat(refundAmount) <= 0 ||
                Number.parseFloat(refundAmount) >
                  Number.parseFloat(refundsData?.remainingToRefund || order.total)
              }
              className="w-full sm:w-auto"
            >
              {createRefund.isPending ? 'Creando...' : 'Crear reembolso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Refund Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Rechazar reembolso</DialogTitle>
            <DialogDescription>
              Por favor indica el motivo del rechazo del reembolso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Motivo del rechazo</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por qué se rechaza el reembolso..."
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectRefund}
              disabled={updateRefundStatus.isPending || !rejectionReason}
              className="w-full sm:w-auto"
            >
              {updateRefundStatus.isPending ? 'Rechazando...' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
