import {
  Button,
  Card,
  CardContent,
  CardDescription,
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
  Skeleton,
  Textarea,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useProduct, useUpdateProduct } from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id/seo')({
  component: ProductSeoPage,
});

const seoSchema = z.object({
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

type SeoFormValues = z.infer<typeof seoSchema>;

function ProductSeoPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoSchema),
    values: product
      ? {
          seoTitle: product.seoTitle || '',
          seoDescription: product.seoDescription || '',
        }
      : undefined,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!product) {
    return null;
  }

  const onSubmit = (data: SeoFormValues) => {
    updateProduct.mutate({ id: product.id, ...data });
  };

  const seoTitle = form.watch('seoTitle') || product.name;
  const seoDescription = form.watch('seoDescription') || product.shortDescription || '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>Optimizacion para motores de busqueda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titulo SEO</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder={product.name} />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/60 caracteres
                    {(field.value?.length || 0) > 60 && (
                      <span className="text-yellow-600 ml-2">
                        Considera acortar el titulo para mejor visibilidad
                      </span>
                    )}
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
                  <FormLabel>Meta descripcion</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder={product.shortDescription || 'Descripcion del producto...'}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/160 caracteres
                    {(field.value?.length || 0) > 160 && (
                      <span className="text-yellow-600 ml-2">
                        La descripcion puede cortarse en los resultados de busqueda
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">Vista previa en Google</p>
              <div className="space-y-1">
                <p className="text-blue-600 text-lg truncate">{seoTitle}</p>
                <p className="text-green-700 text-sm">tutienda.com/producto/{product.slug}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {seoDescription || 'Descripcion del producto...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProduct.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateProduct.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
