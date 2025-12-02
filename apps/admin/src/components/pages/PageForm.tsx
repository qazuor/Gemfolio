import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Textarea,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { generateSlug, type Page, type PageFormData } from '@/hooks/use-pages';

const pageSchema = z.object({
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .max(255, 'El slug es muy largo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras, números y guiones'),
  title: z.string().min(1, 'El título es requerido').max(255, 'El título es muy largo'),
  content: z.string().optional(),
  status: z.enum(['draft', 'published']),
  seoTitle: z.string().max(70, 'El título SEO debe tener máximo 70 caracteres').optional(),
  seoDescription: z
    .string()
    .max(160, 'La descripción SEO debe tener máximo 160 caracteres')
    .optional(),
});

type PageSchemaType = z.infer<typeof pageSchema>;

interface PageFormProps {
  page?: Page;
  onSubmit: (data: PageFormData) => void;
  isLoading?: boolean;
}

export function PageForm({ page, onSubmit, isLoading }: PageFormProps) {
  const form = useForm<PageSchemaType>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      slug: page?.slug || '',
      title: page?.title || '',
      content: page?.content || '',
      status: page?.status || 'draft',
      seoTitle: page?.seoTitle || '',
      seoDescription: page?.seoDescription || '',
    },
  });

  const title = form.watch('title');

  useEffect(() => {
    if (!page && title && !form.getValues('slug')) {
      form.setValue('slug', generateSlug(title));
    }
  }, [title, page, form]);

  const handleTitleBlur = () => {
    if (!page && title && !form.getValues('slug')) {
      form.setValue('slug', generateSlug(title));
    }
  };

  const handleSubmit = (data: PageSchemaType) => {
    onSubmit({
      ...data,
      content: data.content || undefined,
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contenido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: Política de privacidad"
                          onBlur={handleTitleBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">/</span>
                          <Input {...field} placeholder="politica-de-privacidad" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        URL amigable de la página. Solo letras, números y guiones.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Escribe el contenido de la página..."
                          className="min-h-[300px] resize-y"
                        />
                      </FormControl>
                      <FormDescription>
                        Puedes usar Markdown para formatear el texto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título SEO</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Título para motores de búsqueda" />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/70 caracteres. Deja vacío para usar el título de
                        la página.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción SEO</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descripción para motores de búsqueda"
                          className="resize-none"
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/160 caracteres. Breve resumen de la página.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="published">Publicada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Las páginas en borrador no son visibles públicamente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : page ? 'Actualizar página' : 'Crear página'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
