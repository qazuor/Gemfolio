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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCategories } from '@/hooks/use-categories';
import { useProduct, useUpdateProduct } from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id/info')({
  component: ProductInfoPage,
});

const infoSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255),
  slug: z.string().min(1, 'Slug es requerido').max(255),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

type InfoFormValues = z.infer<typeof infoSchema>;

function ProductInfoPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: categories } = useCategories();
  const updateProduct = useUpdateProduct();

  const form = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    values: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          categoryId: product.categoryId || undefined,
          status: product.status,
        }
      : undefined,
  });

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (!product) {
    return null;
  }

  const onSubmit = (data: InfoFormValues) => {
    updateProduct.mutate({ id: product.id, ...data });
  };

  const handleNameChange = (name: string) => {
    if (!form.getValues('slug') || form.getValues('slug') === product.slug) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacion basica</CardTitle>
            <CardDescription>Nombre, descripcion y categoria del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Anillo de plata 925"
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
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
                    <Input {...field} placeholder="anillo-plata-925" />
                  </FormControl>
                  <FormDescription>URL amigable del producto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
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
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion corta</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Breve descripcion del producto"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion completa</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Descripcion detallada del producto"
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
