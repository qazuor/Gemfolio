import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Skeleton,
} from '@gemfolio/ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowUp, History, RefreshCw, RotateCcw } from 'lucide-react';

import {
  getMovementTypeColor,
  getMovementTypeLabel,
  type StockItem,
  useProductMovements,
} from '@/hooks/use-inventory';

interface MovementHistoryModalProps {
  item: StockItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOVEMENT_ICONS = {
  in: ArrowUp,
  out: ArrowDown,
  adjustment: RefreshCw,
  return: RotateCcw,
};

export function MovementHistoryModal({ item, open, onOpenChange }: MovementHistoryModalProps) {
  const { data, isLoading } = useProductMovements(
    item?.productId ?? '',
    item?.variantId ?? undefined
  );

  if (!item) return null;

  const movements = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de movimientos
          </DialogTitle>
          <DialogDescription>
            {item.productName}
            {item.variantName && ` - ${item.variantName}`}
            {item.sku && ` (${item.sku})`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : movements.length === 0 ? (
            <div className="py-8 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => {
                const Icon = MOVEMENT_ICONS[movement.type];
                const isPositive = movement.quantity > 0;

                return (
                  <div key={movement.id} className="flex items-start gap-4 rounded-lg border p-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={getMovementTypeColor(movement.type)}>
                          {getMovementTypeLabel(movement.type)}
                        </Badge>
                        <span
                          className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {isPositive ? '+' : ''}
                          {movement.quantity}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Stock: {movement.previousStock} → {movement.newStock}
                      </p>

                      {movement.reason && (
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                          {movement.reason}
                        </p>
                      )}

                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(movement.createdAt), "dd MMM yyyy 'a las' HH:mm", {
                            locale: es,
                          })}
                        </span>
                        {movement.createdByUser && (
                          <>
                            <span>•</span>
                            <span>{movement.createdByUser.name || 'Usuario'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
