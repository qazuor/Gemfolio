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
  Switch,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useProduct, useUpdateProduct } from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id/inventario')({
  component: ProductInventarioPage,
});

const inventarioSchema = z.object({
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(true),
});

type InventarioFormValues = z.infer<typeof inventarioSchema>;

function ProductInventarioPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const form = useForm<InventarioFormValues>({
    resolver: zodResolver(inventarioSchema),
    values: product
      ? {
          sku: product.sku || '',
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          trackInventory: product.trackInventory,
        }
      : undefined,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!product) {
    return null;
  }

  const onSubmit = (data: InventarioFormValues) => {
    updateProduct.mutate({ id: product.id, ...data });
  };

  const stock = form.watch('stock');
  const lowStockThreshold = form.watch('lowStockThreshold');
  const trackInventory = form.watch('trackInventory');
  const isLowStock = trackInventory && stock <= lowStockThreshold;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
            <CardDescription>Gestiona el stock del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="ABC-123" />
                  </FormControl>
                  <FormDescription>Codigo unico del producto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trackInventory"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Rastrear inventario</FormLabel>
                    <FormDescription>Controlar el stock de este producto</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {trackInventory && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock actual</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(Number.parseInt(e.target.value, 10) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Umbral de stock bajo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? 5}
                            onChange={(e) =>
                              field.onChange(Number.parseInt(e.target.value, 10) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Alertar cuando el stock sea menor a este valor
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isLowStock && (
                  <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-600">Stock bajo</p>
                      <p className="text-sm text-muted-foreground">
                        El stock actual ({stock}) es igual o menor al umbral configurado (
                        {lowStockThreshold})
                      </p>
                    </div>
                  </div>
                )}
              </>
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
