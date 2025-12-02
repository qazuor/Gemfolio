import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@gemfolio/ui';
import { useState } from 'react';

import { getStatusColor, getStatusLabel, useUpdateOrderStatus } from '@/hooks/use-orders';

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState('');

  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    updateStatus.mutate(
      {
        id: orderId,
        status: selectedStatus,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setNote('');
        },
      }
    );
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedStatus(currentStatus);
    setNote('');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant={getStatusColor(currentStatus)} className="text-sm">
          {getStatusLabel(currentStatus)}
        </Badge>
        <Select
          value={currentStatus}
          onValueChange={(val) => handleStatusChange(val as OrderStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cambiar estado" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status} disabled={status === currentStatus}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar estado del pedido</DialogTitle>
            <DialogDescription>
              El estado cambiará de{' '}
              <Badge variant={getStatusColor(currentStatus)} className="mx-1">
                {getStatusLabel(currentStatus)}
              </Badge>
              a
              <Badge variant={getStatusColor(selectedStatus)} className="mx-1">
                {getStatusLabel(selectedStatus)}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Nota (opcional)</Label>
              <Textarea
                id="note"
                placeholder="Agregar una nota sobre este cambio de estado..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Esta nota quedará registrada en el historial del pedido
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={updateStatus.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? 'Actualizando...' : 'Confirmar cambio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
