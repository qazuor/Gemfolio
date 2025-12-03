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
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useProduct, useUpdateProduct } from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id/precios')({
  component: ProductPreciosPage,
});

const preciosSchema = z.object({
  price: z.number().min(0, 'El precio debe ser positivo'),
  comparePrice: z.number().optional(),
  cost: z.number().optional(),
});

type PreciosFormValues = z.infer<typeof preciosSchema>;

function ProductPreciosPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const form = useForm<PreciosFormValues>({
    resolver: zodResolver(preciosSchema),
    values: product
      ? {
          price: Number.parseFloat(product.price),
          comparePrice: product.comparePrice ? Number.parseFloat(product.comparePrice) : undefined,
          cost: product.cost ? Number.parseFloat(product.cost) : undefined,
        }
      : undefined,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!product) {
    return null;
  }

  const onSubmit = (data: PreciosFormValues) => {
    updateProduct.mutate({ id: product.id, ...data });
  };

  const price = form.watch('price') || 0;
  const cost = form.watch('cost') || 0;
  const margin = cost > 0 ? ((price - cost) / price) * 100 : 0;
  const profit = price - cost;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Precios</CardTitle>
            <CardDescription>Configura los precios del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number.parseFloat(e.target.value) : 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comparePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de comparacion</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number.parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Precio tachado (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number.parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Costo del producto (interno, para calcular margenes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {cost > 0 && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-2">Analisis de margen</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ganancia</p>
                    <p className="font-medium text-lg">${profit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margen</p>
                    <p
                      className={`font-medium text-lg ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}
                    >
                      {margin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
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
