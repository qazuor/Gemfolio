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
  defaultSocialSettings,
  type SocialSettings,
  useUpdateSettings,
} from '@/hooks/use-settings';

const socialSchema = z.object({
  instagram: z.string().url('URL inválida').or(z.literal('')).optional(),
  facebook: z.string().url('URL inválida').or(z.literal('')).optional(),
  whatsapp: z.string().optional(),
  tiktok: z.string().url('URL inválida').or(z.literal('')).optional(),
});

interface SocialSettingsFormProps {
  initialData?: SocialSettings;
}

export function SocialSettingsForm({ initialData }: SocialSettingsFormProps) {
  const updateSettings = useUpdateSettings<SocialSettings>('social');

  const form = useForm<SocialSettings>({
    resolver: zodResolver(socialSchema),
    defaultValues: initialData || defaultSocialSettings,
  });

  const onSubmit = (data: SocialSettings) => {
    updateSettings.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://instagram.com/tu_tienda" />
                </FormControl>
                <FormDescription>URL de tu perfil de Instagram</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://facebook.com/tu_tienda" />
                </FormControl>
                <FormDescription>URL de tu página de Facebook</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+5491112345678" />
                </FormControl>
                <FormDescription>Número de WhatsApp con código de país</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tiktok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TikTok</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://tiktok.com/@tu_tienda" />
                </FormControl>
                <FormDescription>URL de tu perfil de TikTok</FormDescription>
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
