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
  Switch,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  defaultNotificationSettings,
  type NotificationSettings,
  useUpdateSettings,
} from '@/hooks/use-settings';

const notificationSchema = z.object({
  orderEmail: z.string().email('Email inválido'),
  notifyNewOrder: z.boolean(),
  notifyLowStock: z.boolean(),
  lowStockThreshold: z.coerce.number().min(1, 'El umbral debe ser mayor a 0'),
});

interface NotificationSettingsFormProps {
  initialData?: NotificationSettings;
}

export function NotificationSettingsForm({ initialData }: NotificationSettingsFormProps) {
  const updateSettings = useUpdateSettings<NotificationSettings>('notifications');

  const form = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSchema),
    defaultValues: initialData || defaultNotificationSettings,
  });

  const onSubmit = (data: NotificationSettings) => {
    updateSettings.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="orderEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email para notificaciones</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="pedidos@ejemplo.com" />
              </FormControl>
              <FormDescription>Email donde recibirás las notificaciones de pedidos</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="notifyNewOrder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Notificar nuevos pedidos</FormLabel>
                  <FormDescription>
                    Recibir un email cuando se realice un nuevo pedido
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notifyLowStock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Notificar stock bajo</FormLabel>
                  <FormDescription>
                    Recibir un email cuando un producto tenga stock bajo
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="lowStockThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Umbral de stock bajo</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={1} placeholder="5" />
              </FormControl>
              <FormDescription>
                Se notificará cuando el stock sea menor o igual a este número
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
