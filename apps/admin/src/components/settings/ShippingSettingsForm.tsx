import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  defaultShippingSettings,
  type ShippingSettings,
  useUpdateSettings,
} from '@/hooks/use-settings';

const shippingSchema = z.object({
  flatRate: z.coerce.number().min(0, 'El costo debe ser mayor o igual a 0'),
  freeShippingThreshold: z.coerce.number().min(0, 'El monto debe ser mayor o igual a 0'),
  shippingInfo: z.string(),
});

interface ShippingSettingsFormProps {
  initialData?: ShippingSettings;
}

export function ShippingSettingsForm({ initialData }: ShippingSettingsFormProps) {
  const updateSettings = useUpdateSettings<ShippingSettings>('shipping');

  const form = useForm<ShippingSettings>({
    resolver: zodResolver(shippingSchema),
    defaultValues: initialData || defaultShippingSettings,
  });

  const onSubmit = (data: ShippingSettings) => {
    updateSettings.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="flatRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de envío fijo</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} step={0.01} placeholder="0" />
                </FormControl>
                <FormDescription>Costo fijo de envío para todos los pedidos</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="freeShippingThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Envío gratis a partir de</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} step={0.01} placeholder="0" />
                </FormControl>
                <FormDescription>
                  Monto mínimo para envío gratis (0 = sin envío gratis)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shippingInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Información de envío</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Tiempos de entrega, zonas de cobertura, etc."
                  className="min-h-[120px] resize-y"
                />
              </FormControl>
              <FormDescription>
                Información que se mostrará a los clientes sobre envíos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </Form>
  );
}
