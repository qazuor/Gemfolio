import {
  Button,
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
  Textarea,
} from '@gemfolio/ui';
import { ArrowDown, ArrowUp, RefreshCw, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type StockItem, useAdjustStock } from '@/hooks/use-inventory';

type MovementType = 'in' | 'out' | 'adjustment' | 'return';

interface AdjustStockModalProps {
  item: StockItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOVEMENT_TYPES: { value: MovementType; label: string; icon: typeof ArrowUp }[] = [
  { value: 'in', label: 'Entrada', icon: ArrowUp },
  { value: 'out', label: 'Salida', icon: ArrowDown },
  { value: 'adjustment', label: 'Ajuste', icon: RefreshCw },
  { value: 'return', label: 'Devolución', icon: RotateCcw },
];

export function AdjustStockModal({ item, open, onOpenChange }: AdjustStockModalProps) {
  const [type, setType] = useState<MovementType>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const adjustStock = useAdjustStock();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setType('in');
      setQuantity('');
      setReason('');
    }
  }, [open]);

  if (!item) return null;

  const parsedQuantity = Number.parseInt(quantity, 10) || 0;
  const adjustedQuantity = type === 'out' ? -Math.abs(parsedQuantity) : Math.abs(parsedQuantity);
  const newStock = item.currentStock + adjustedQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedQuantity === 0) return;

    adjustStock.mutate(
      {
        productId: item.variantId ? undefined : item.productId,
        variantId: item.variantId || undefined,
        type,
        quantity: adjustedQuantity,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] sm:w-full">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajustar stock</DialogTitle>
            <DialogDescription>
              {item.productName}
              {item.variantName && ` - ${item.variantName}`}
              {item.sku && ` (${item.sku})`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Movement Type */}
            <div className="space-y-2">
              <Label>Tipo de movimiento</Label>
              <Select value={type} onValueChange={(val) => setType(val as MovementType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {/* Stock Preview */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stock actual</span>
                <span className="font-medium">{item.currentStock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ajuste</span>
                <span
                  className={
                    adjustedQuantity > 0
                      ? 'font-medium text-green-600'
                      : adjustedQuantity < 0
                        ? 'font-medium text-red-600'
                        : 'font-medium'
                  }
                >
                  {adjustedQuantity > 0 ? '+' : ''}
                  {adjustedQuantity}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 text-sm">
                <span className="font-medium">Nuevo stock</span>
                <span
                  className={`font-bold ${newStock < 0 ? 'text-destructive' : newStock <= (item.lowStockThreshold ?? 5) ? 'text-yellow-600' : ''}`}
                >
                  {newStock}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Ej: Inventario físico, Producto dañado, Recepción de mercadería..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={adjustStock.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={parsedQuantity === 0 || newStock < 0 || adjustStock.isPending}
              className="w-full sm:w-auto"
            >
              {adjustStock.isPending ? 'Guardando...' : 'Guardar ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
