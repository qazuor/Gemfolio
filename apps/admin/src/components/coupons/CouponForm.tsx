import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Textarea,
} from '@gemfolio/ui';
import { useNavigate } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  type Coupon,
  type CreateCouponData,
  generateCouponCode,
  useCreateCoupon,
  useUpdateCoupon,
} from '@/hooks/use-coupons';

type CouponType = 'percentage' | 'fixed' | 'free_shipping';

interface CouponFormProps {
  coupon?: Coupon;
}

export function CouponForm({ coupon }: CouponFormProps) {
  const navigate = useNavigate();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();

  const isEditing = !!coupon;

  const [formData, setFormData] = useState<CreateCouponData>({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minimumPurchase: null,
    maximumDiscount: null,
    usageLimit: null,
    usagePerUser: 1,
    validFrom: null,
    validUntil: null,
    isActive: true,
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type,
        value: coupon.value,
        minimumPurchase: coupon.minimumPurchase,
        maximumDiscount: coupon.maximumDiscount,
        usageLimit: coupon.usageLimit,
        usagePerUser: coupon.usagePerUser,
        validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : null,
        validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : null,
        isActive: coupon.isActive,
      });
    }
  }, [coupon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
    };

    if (isEditing) {
      updateCoupon.mutate(
        { id: coupon.id, ...data },
        {
          onSuccess: () => navigate({ to: '/cupones' }),
        }
      );
    } else {
      createCoupon.mutate(data, {
        onSuccess: () => navigate({ to: '/cupones' }),
      });
    }
  };

  const handleGenerateCode = () => {
    setFormData((prev) => ({ ...prev, code: generateCouponCode() }));
  };

  const isPending = createCoupon.isPending || updateCoupon.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del cupón</CardTitle>
            <CardDescription>Datos principales del cupón de descuento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="DESCUENTO20"
                  className="font-mono"
                  required
                />
                <Button type="button" variant="outline" onClick={handleGenerateCode}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Código único que los clientes usarán al pagar
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del cupón (uso interno)"
                rows={2}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Tipo de descuento *</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val as CouponType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed">Monto fijo</SelectItem>
                  <SelectItem value="free_shipping">Envío gratis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            {formData.type !== 'free_shipping' && (
              <div className="space-y-2">
                <Label htmlFor="value">
                  Valor * {formData.type === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  max={formData.type === 'percentage' ? '100' : undefined}
                  value={formData.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder={formData.type === 'percentage' ? '20' : '500'}
                  required
                />
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Estado</Label>
                <p className="text-xs text-muted-foreground">
                  Los cupones inactivos no pueden ser usados
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Limits & Validity */}
        <Card>
          <CardHeader>
            <CardTitle>Restricciones</CardTitle>
            <CardDescription>Configura límites y vigencia del cupón</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Minimum Purchase */}
            <div className="space-y-2">
              <Label htmlFor="minimumPurchase">Compra mínima ($)</Label>
              <Input
                id="minimumPurchase"
                type="number"
                min="0"
                step="0.01"
                value={formData.minimumPurchase || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minimumPurchase: e.target.value || null,
                  }))
                }
                placeholder="Sin mínimo"
              />
            </div>

            {/* Maximum Discount (only for percentage) */}
            {formData.type === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="maximumDiscount">Descuento máximo ($)</Label>
                <Input
                  id="maximumDiscount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maximumDiscount || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maximumDiscount: e.target.value || null,
                    }))
                  }
                  placeholder="Sin límite"
                />
                <p className="text-xs text-muted-foreground">
                  Límite máximo de descuento aplicable
                </p>
              </div>
            )}

            <Separator />

            {/* Usage Limits */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Límite de uso total</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  value={formData.usageLimit || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usageLimit: e.target.value ? Number.parseInt(e.target.value, 10) : null,
                    }))
                  }
                  placeholder="Sin límite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usagePerUser">Uso por cliente</Label>
                <Input
                  id="usagePerUser"
                  type="number"
                  min="1"
                  value={formData.usagePerUser || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usagePerUser: e.target.value ? Number.parseInt(e.target.value, 10) : null,
                    }))
                  }
                  placeholder="1"
                />
              </div>
            </div>

            <Separator />

            {/* Validity Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Válido desde</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validFrom: e.target.value || null,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Válido hasta</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validUntil: e.target.value || null,
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => navigate({ to: '/cupones' })}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear cupón'}
        </Button>
      </div>
    </form>
  );
}
