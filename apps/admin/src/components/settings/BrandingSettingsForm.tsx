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
  Separator,
  Switch,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ImageUploadField } from '@/components/shared/image-upload-field';
import {
  type BrandingSettings,
  bodyFontOptions,
  borderRadiusOptions,
  buttonStyleOptions,
  cardStyleOptions,
  defaultBrandingSettings,
  headerStyleOptions,
  headingFontOptions,
  heroStyleOptions,
  useUpdateSettings,
} from '@/hooks/use-settings';

const brandingSchema = z.object({
  logo: z.string().url('URL inválida').or(z.literal('')),
  logoDark: z.string().url('URL inválida').or(z.literal('')),
  favicon: z.string().url('URL inválida').or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
  headingFont: z.enum([
    'playfair',
    'cormorant',
    'libre-baskerville',
    'lora',
    'merriweather',
    'inter',
  ]),
  bodyFont: z.enum(['inter', 'open-sans', 'roboto', 'lato', 'source-sans']),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']),
  headerStyle: z.enum(['transparent', 'solid', 'gradient']),
  buttonStyle: z.enum(['solid', 'outline', 'soft']),
  cardStyle: z.enum(['minimal', 'bordered', 'elevated', 'glass']),
  heroStyle: z.enum(['full', 'split', 'minimal']),
  showFeaturedCategories: z.boolean(),
  showTestimonials: z.boolean(),
  showNewsletter: z.boolean(),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Logos Section */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Logos e iconos</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo principal</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      value={field.value}
                      onChange={field.onChange}
                      endpoint="brandingAsset"
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  </FormControl>
                  <FormDescription>Logo para modo claro</FormDescription>
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
                    <ImageUploadField
                      value={field.value}
                      onChange={field.onChange}
                      endpoint="brandingAsset"
                      placeholder="https://ejemplo.com/logo-dark.png"
                    />
                  </FormControl>
                  <FormDescription>Logo para modo oscuro</FormDescription>
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
                    <ImageUploadField
                      value={field.value}
                      onChange={field.onChange}
                      endpoint="brandingAsset"
                      placeholder="https://ejemplo.com/favicon.ico"
                      accept={{ 'image/*': ['.png', '.ico', '.svg'] }}
                    />
                  </FormControl>
                  <FormDescription>Icono de pestaña</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Colors Section */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Colores de la marca</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color primario</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} className="h-10 w-14 cursor-pointer p-1" />
                      <Input {...field} placeholder="#B8860B" className="flex-1" />
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
                      <Input {...field} placeholder="#1A1A1A" className="flex-1" />
                    </div>
                  </FormControl>
                  <FormDescription>Color secundario</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color de acento</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} className="h-10 w-14 cursor-pointer p-1" />
                      <Input {...field} placeholder="#D4AF37" className="flex-1" />
                    </div>
                  </FormControl>
                  <FormDescription>Para detalles y hover</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Typography Section */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Tipografía</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="headingFont"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuente de títulos</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una fuente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {headingFontOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Fuente para títulos y encabezados</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bodyFont"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuente de texto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una fuente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bodyFontOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Fuente para textos y párrafos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Style Section */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Estilo de componentes</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="borderRadius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bordes redondeados</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {borderRadiusOptions.map((option) => (
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
              name="headerStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo del header</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {headerStyleOptions.map((option) => (
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
              name="buttonStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo de botones</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buttonStyleOptions.map((option) => (
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
              name="cardStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo de tarjetas</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cardStyleOptions.map((option) => (
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
        </div>

        <Separator />

        {/* Homepage Section */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Página de inicio</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="heroStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo del hero</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {heroStyleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Estilo de la sección principal del inicio</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="showFeaturedCategories"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Categorías destacadas</FormLabel>
                      <FormDescription>Mostrar sección de categorías</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showTestimonials"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Testimonios</FormLabel>
                      <FormDescription>Mostrar opiniones de clientes</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showNewsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Newsletter</FormLabel>
                      <FormDescription>Mostrar suscripción a boletín</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={updateSettings.isPending} size="lg">
            {updateSettings.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
