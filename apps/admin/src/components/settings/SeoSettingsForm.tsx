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

import { defaultSeoSettings, type SeoSettings, useUpdateSettings } from '@/hooks/use-settings';

const seoSchema = z.object({
  siteTitle: z.string().max(70, 'El título debe tener máximo 70 caracteres'),
  siteDescription: z.string().max(160, 'La descripción debe tener máximo 160 caracteres'),
  ogImage: z.string().url('URL inválida').or(z.literal('')),
  googleAnalyticsId: z.string().optional(),
});

interface SeoSettingsFormProps {
  initialData?: SeoSettings;
}

export function SeoSettingsForm({ initialData }: SeoSettingsFormProps) {
  const updateSettings = useUpdateSettings<SeoSettings>('seo');

  const form = useForm<SeoSettings>({
    resolver: zodResolver(seoSchema),
    defaultValues: initialData || defaultSeoSettings,
  });

  const onSubmit = (data: SeoSettings) => {
    updateSettings.mutate(data);
  };

  const siteTitle = form.watch('siteTitle');
  const siteDescription = form.watch('siteDescription');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="siteTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del sitio</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Mi Joyería - Joyas exclusivas" />
              </FormControl>
              <FormDescription>
                {siteTitle?.length || 0}/70 caracteres. Aparece en la pestaña del navegador y
                resultados de búsqueda.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="siteDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del sitio</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descubre nuestra colección de joyas artesanales..."
                  className="resize-none"
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                {siteDescription?.length || 0}/160 caracteres. Aparece en los resultados de
                búsqueda.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ogImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen para redes sociales</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://ejemplo.com/og-image.jpg" />
              </FormControl>
              <FormDescription>
                Imagen que aparece cuando se comparte el sitio en redes sociales (1200x630px
                recomendado)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="googleAnalyticsId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Analytics ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="G-XXXXXXXXXX" />
              </FormControl>
              <FormDescription>ID de medición de Google Analytics 4 (opcional)</FormDescription>
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
