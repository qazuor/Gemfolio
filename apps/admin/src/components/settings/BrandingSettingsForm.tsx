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
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  type BrandingSettings,
  defaultBrandingSettings,
  useUpdateSettings,
} from '@/hooks/use-settings';

const brandingSchema = z.object({
  logo: z.string().url('URL inválida').or(z.literal('')),
  logoDark: z.string().url('URL inválida').or(z.literal('')),
  favicon: z.string().url('URL inválida').or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
});

interface BrandingSettingsFormProps {
  initialData?: BrandingSettings;
}

export function BrandingSettingsForm({ initialData }: BrandingSettingsFormProps) {
  const updateSettings = useUpdateSettings<BrandingSettings>('branding');

  const form = useForm<BrandingSettings>({
    resolver: zodResolver(brandingSchema),
    defaultValues: initialData || defaultBrandingSettings,
  });

  const onSubmit = (data: BrandingSettings) => {
    updateSettings.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo principal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://ejemplo.com/logo.png" />
                </FormControl>
                <FormDescription>URL del logo para modo claro</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoDark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo modo oscuro</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://ejemplo.com/logo-dark.png" />
                </FormControl>
                <FormDescription>URL del logo para modo oscuro</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="favicon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Favicon</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://ejemplo.com/favicon.ico" />
                </FormControl>
                <FormDescription>URL del icono de la pestaña del navegador</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color primario</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input type="color" {...field} className="h-10 w-14 cursor-pointer p-1" />
                    <Input {...field} placeholder="#000000" className="flex-1" />
                  </div>
                </FormControl>
                <FormDescription>Color principal de la marca</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color secundario</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input type="color" {...field} className="h-10 w-14 cursor-pointer p-1" />
                    <Input {...field} placeholder="#ffffff" className="flex-1" />
                  </div>
                </FormControl>
                <FormDescription>Color secundario de la marca</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </Form>
  );
}
