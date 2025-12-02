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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  currencyOptions,
  defaultGeneralSettings,
  type GeneralSettings,
  timezoneOptions,
  useUpdateSettings,
} from '@/hooks/use-settings';

const generalSchema = z.object({
  businessName: z.string().min(1, 'El nombre del negocio es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.enum(['ARS', 'USD']),
  timezone: z.string().min(1, 'La zona horaria es requerida'),
});

interface GeneralSettingsFormProps {
  initialData?: GeneralSettings;
}

export function GeneralSettingsForm({ initialData }: GeneralSettingsFormProps) {
  const updateSettings = useUpdateSettings<GeneralSettings>('general');

  const form = useForm<GeneralSettings>({
    resolver: zodResolver(generalSchema),
    defaultValues: initialData || defaultGeneralSettings,
  });

  const onSubmit = (data: GeneralSettings) => {
    updateSettings.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del negocio</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Mi Joyería" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de contacto</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="contacto@ejemplo.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+54 11 1234-5678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zona horaria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una zona horaria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timezoneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Dirección física del negocio"
                  className="resize-none"
                  rows={2}
                />
              </FormControl>
              <FormDescription>
                Dirección que se mostrará en el pie de página y contacto
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
