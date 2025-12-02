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
  Textarea,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Package, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateBundle, useUpdateBundle } from '@/hooks/use-bundles';
import { useProducts } from '@/hooks/use-products';

interface BundleItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: string;
    images?: Array<{ url: string; isPrimary: boolean }>;
  };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: string;
  comparePrice: string | null;
  status: 'draft' | 'active' | 'archived';
  validFrom: string | null;
  validUntil: string | null;
  items: BundleItem[];
}

interface BundleFormProps {
  bundle?: Bundle;
}

const bundleFormSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255),
  slug: z
    .string()
    .min(1, 'Slug es requerido')
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug debe ser lowercase con guiones'),
  description: z.string().optional(),
  image: z.string().url('URL de imagen inválida').nullable().optional(),
  price: z.number().min(0, 'El precio debe ser positivo'),
  comparePrice: z.number().nullable().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Producto es requerido'),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().min(1, 'Cantidad debe ser al menos 1'),
      })
    )
    .min(2, 'Un bundle debe tener al menos 2 productos'),
});

type FormValues = z.infer<typeof bundleFormSchema>;

export function BundleForm({ bundle }: BundleFormProps) {
  const navigate = useNavigate();
  const [showProductSelector, setShowProductSelector] = useState(false);
  const createBundle = useCreateBundle();
  const updateBundle = useUpdateBundle();
  const { data: productsData } = useProducts({ limit: 100, status: 'active' });

  const form = useForm<FormValues>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues: {
      name: bundle?.name || '',
      slug: bundle?.slug || '',
      description: bundle?.description || '',
      image: bundle?.image || null,
      price: bundle ? Number.parseFloat(bundle.price) : 0,
      comparePrice: bundle?.comparePrice ? Number.parseFloat(bundle.comparePrice) : null,
      status: bundle?.status || 'draft',
      validFrom: bundle?.validFrom || null,
      validUntil: bundle?.validUntil || null,
      items:
        bundle?.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const isSubmitting = createBundle.isPending || updateBundle.isPending;

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      price: data.price.toFixed(2),
      comparePrice: data.comparePrice ? data.comparePrice.toFixed(2) : null,
    };

    if (bundle) {
      updateBundle.mutate(
        { id: bundle.id, ...payload },
        {
          onSuccess: () => navigate({ to: '/bundles' }),
        }
      );
    } else {
      createBundle.mutate(payload, {
        onSuccess: () => navigate({ to: '/bundles' }),
      });
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    if (!bundle && !form.getValues('slug')) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', slug);
    }
  };

  const handleAddProduct = (productId: string) => {
    const existingItem = fields.find((item) => item.productId === productId);
    if (existingItem) {
      return;
    }
    append({ productId, variantId: null, quantity: 1 });
    setShowProductSelector(false);
  };

  const getProductById = (productId: string) => {
    return productsData?.data.find((p) => p.id === productId);
  };

  // Calculate total price of individual products
  const calculateIndividualTotal = () => {
    return fields.reduce((total, item) => {
      const product = getProductById(item.productId);
      if (product) {
        return total + Number.parseFloat(product.price) * item.quantity;
      }
      return total;
    }, 0);
  };

  const individualTotal = calculateIndividualTotal();
  const bundlePrice = form.watch('price') || 0;
  const savings = individualTotal - bundlePrice;
  const savingsPercent = individualTotal > 0 ? (savings / individualTotal) * 100 : 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
                <CardDescription>Nombre, descripción y configuración del bundle</CardDescription>
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
                          placeholder="Set de anillos básicos"
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
                        <Input {...field} placeholder="set-anillos-basicos" />
                      </FormControl>
                      <FormDescription>URL amigable del bundle</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descripción del bundle" rows={3} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <Card>
              <CardHeader>
                <CardTitle>Productos del bundle</CardTitle>
                <CardDescription>
                  Selecciona los productos que forman parte de este bundle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-4">
                      Agrega al menos 2 productos al bundle
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowProductSelector(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar producto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field, index) => {
                      const product = getProductById(field.productId);
                      const primaryImage =
                        product?.images?.find((img) => img.isPrimary) || product?.images?.[0];

                      return (
                        <div
                          key={field.id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={product?.name || ''}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product?.name || 'Producto no encontrado'}
                            </p>
                            {product && (
                              <p className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat('es-AR', {
                                  style: 'currency',
                                  currency: 'ARS',
                                }).format(Number.parseFloat(product.price))}
                              </p>
                            )}
                          </div>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field: quantityField }) => (
                              <FormItem className="w-20">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    {...quantityField}
                                    onChange={(e) =>
                                      quantityField.onChange(
                                        Number.parseInt(e.target.value, 10) || 1
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProductSelector(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar producto
                    </Button>
                  </div>
                )}
                {form.formState.errors.items && (
                  <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Precio</CardTitle>
                <CardDescription>Configura el precio del bundle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio del bundle</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
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
                      <FormLabel>Precio de comparación</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number.parseFloat(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>Precio tachado (opcional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {fields.length >= 2 && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio individual:</span>
                      <span>
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                        }).format(individualTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio bundle:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                        }).format(bundlePrice)}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Ahorro:</span>
                        <span>
                          {new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: 'ARS',
                          }).format(savings)}{' '}
                          ({savingsPercent.toFixed(0)}%)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vigencia</CardTitle>
                <CardDescription>Período de validez del bundle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido desde</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value ? new Date(field.value).toISOString().slice(0, 16) : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value).toISOString() : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido hasta</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value ? new Date(field.value).toISOString().slice(0, 16) : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value).toISOString() : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/bundles' })}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Guardando...' : bundle ? 'Guardar cambios' : 'Crear bundle'}
          </Button>
        </div>

        {/* Product Selector Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Seleccionar producto</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProductSelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {productsData?.data.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay productos disponibles
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {productsData?.data
                      .filter((product) => !fields.some((item) => item.productId === product.id))
                      .map((product) => {
                        const primaryImage =
                          product.images?.find((img) => img.isPrimary) || product.images?.[0];

                        return (
                          <button
                            key={product.id}
                            type="button"
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left w-full"
                            onClick={() => handleAddProduct(product.id)}
                          >
                            <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                              {primaryImage ? (
                                <img
                                  src={primaryImage.url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                  <Package className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat('es-AR', {
                                  style: 'currency',
                                  currency: 'ARS',
                                }).format(Number.parseFloat(product.price))}
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
