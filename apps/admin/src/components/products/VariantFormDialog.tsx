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
} from '@gemfolio/ui';
import { Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VariantFormData {
  name: string;
  sku: string;
  price: string;
  comparePrice: string;
  stock: number;
  lowStockThreshold: number;
  attributes: Record<string, string>;
}

interface VariantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VariantFormData) => void;
  initialData?: Partial<VariantFormData>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function VariantFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
  mode,
}: VariantFormDialogProps) {
  const [formData, setFormData] = useState<VariantFormData>({
    name: '',
    sku: '',
    price: '',
    comparePrice: '',
    stock: 0,
    lowStockThreshold: 5,
    attributes: {},
  });

  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        price: initialData.price || '',
        comparePrice: initialData.comparePrice || '',
        stock: initialData.stock || 0,
        lowStockThreshold: initialData.lowStockThreshold || 5,
        attributes: initialData.attributes || {},
      });
    } else if (open && !initialData) {
      setFormData({
        name: '',
        sku: '',
        price: '',
        comparePrice: '',
        stock: 0,
        lowStockThreshold: 5,
        attributes: {},
      });
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [newAttributeKey.trim()]: newAttributeValue.trim(),
        },
      }));
      setNewAttributeKey('');
      setNewAttributeValue('');
    }
  };

  const removeAttribute = (key: string) => {
    setFormData((prev) => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return { ...prev, attributes: newAttributes };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Agregar variante' : 'Editar variante'}</DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Crea una nueva variante para este producto'
                : 'Modifica los datos de la variante'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Talla M - Dorado"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  placeholder="Ej: PROD-001-M-GLD"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Precio comparacion</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.comparePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, comparePrice: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stock: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Umbral stock bajo</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lowStockThreshold: parseInt(e.target.value, 10) || 5,
                    }))
                  }
                />
              </div>
            </div>

            {/* Attributes Section */}
            <div className="space-y-2">
              <Label>Atributos (opcional)</Label>
              <div className="text-xs text-muted-foreground mb-2">
                Ej: Color = Dorado, Talla = M
              </div>

              {/* Existing Attributes */}
              {Object.entries(formData.attributes).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(formData.attributes).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-sm"
                    >
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(key)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Attribute */}
              <div className="flex gap-2">
                <Input
                  placeholder="Atributo"
                  value={newAttributeKey}
                  onChange={(e) => setNewAttributeKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Valor"
                  value={newAttributeValue}
                  onChange={(e) => setNewAttributeValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addAttribute}
                  disabled={!newAttributeKey.trim() || !newAttributeValue.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.sku || !formData.price}
              className="w-full sm:w-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Agregar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
