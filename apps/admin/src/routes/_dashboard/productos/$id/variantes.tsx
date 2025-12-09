import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Edit, Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { VariantFormDialog } from '@/components/products/VariantFormDialog';
import {
  useAddProductVariants,
  useDeleteVariant,
  useDisableVariants,
  useEnableVariants,
  useProduct,
  useSetDefaultVariant,
  useUpdateVariant,
} from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id/variantes')({
  component: ProductVariantesPage,
});

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: string;
  comparePrice: string | null;
  stock: number;
  lowStockThreshold: number;
  attributes: Record<string, string>;
  isDefault: boolean;
}

function ProductVariantesPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);

  const enableVariants = useEnableVariants();
  const disableVariants = useDisableVariants();
  const addVariants = useAddProductVariants();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();
  const setDefaultVariant = useSetDefaultVariant();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<Variant | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!product) {
    return null;
  }

  const variants = (product.variants || []) as Variant[];
  const hasVariants = product.hasVariants;

  const formatCurrency = (value: string | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(value));
  };

  const handleEnableVariants = () => {
    enableVariants.mutate(id);
  };

  const handleDisableVariants = () => {
    disableVariants.mutate(id, {
      onSuccess: () => setDisableDialogOpen(false),
    });
  };

  const handleAddVariant = (data: {
    name: string;
    sku: string;
    price: string;
    comparePrice: string;
    stock: number;
    lowStockThreshold: number;
    attributes: Record<string, string>;
  }) => {
    addVariants.mutate(
      {
        productId: id,
        variants: [
          {
            name: data.name,
            sku: data.sku,
            price: data.price,
            comparePrice: data.comparePrice || undefined,
            stock: data.stock,
            lowStockThreshold: data.lowStockThreshold,
            attributes: data.attributes,
            isDefault: variants.length === 0,
          },
        ],
      },
      {
        onSuccess: () => setFormDialogOpen(false),
      }
    );
  };

  const handleEditVariant = (data: {
    name: string;
    sku: string;
    price: string;
    comparePrice: string;
    stock: number;
    lowStockThreshold: number;
    attributes: Record<string, string>;
  }) => {
    if (!editingVariant) return;

    updateVariant.mutate(
      {
        productId: id,
        variantId: editingVariant.id,
        data: {
          name: data.name,
          sku: data.sku,
          price: data.price,
          comparePrice: data.comparePrice || null,
          stock: data.stock,
          lowStockThreshold: data.lowStockThreshold,
          attributes: data.attributes,
        },
      },
      {
        onSuccess: () => {
          setEditingVariant(null);
          setFormDialogOpen(false);
        },
      }
    );
  };

  const handleDeleteVariant = () => {
    if (!deletingVariant) return;

    deleteVariant.mutate(
      { productId: id, variantId: deletingVariant.id },
      {
        onSuccess: () => setDeletingVariant(null),
      }
    );
  };

  const handleSetDefault = (variantId: string) => {
    setDefaultVariant.mutate({ productId: id, variantId });
  };

  const openEditDialog = (variant: Variant) => {
    setEditingVariant(variant);
    setFormDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingVariant(null);
    setFormDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Variantes del producto</CardTitle>
            <CardDescription>
              Gestiona las variantes como tallas, colores o materiales
            </CardDescription>
          </div>
          {hasVariants && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDisableDialogOpen(true)}>
                Desactivar variantes
              </Button>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar variante
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!hasVariants ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Este producto no tiene variantes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Las variantes te permiten ofrecer diferentes opciones del mismo producto (ej:
                diferentes tallas, colores, materiales)
              </p>
              <Button onClick={handleEnableVariants} disabled={enableVariants.isPending}>
                {enableVariants.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Activar variantes
              </Button>
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay variantes creadas</p>
              <p className="text-sm mb-4">Agrega variantes para ofrecer diferentes opciones</p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar primera variante
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Atributos</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="w-[140px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {variant.name || 'Sin nombre'}
                        {variant.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                            Default
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {variant.sku || '-'}
                      </code>
                    </TableCell>
                    <TableCell>
                      {Object.entries(variant.attributes || {}).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(variant.attributes).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        {formatCurrency(variant.price)}
                        {variant.comparePrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(variant.comparePrice)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          variant.stock > (variant.lowStockThreshold || 5)
                            ? 'default'
                            : variant.stock > 0
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {variant.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!variant.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSetDefault(variant.id)}
                            disabled={setDefaultVariant.isPending}
                            title="Establecer como default"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeletingVariant(variant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {hasVariants && (
        <Card>
          <CardHeader>
            <CardTitle>Informacion sobre variantes</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul className="text-muted-foreground space-y-2">
              <li>Cada variante tiene su propio SKU, precio y stock</li>
              <li>Los atributos te ayudan a diferenciar variantes (ej: Color, Talla)</li>
              <li>La variante marcada como "Default" se muestra por defecto en la tienda</li>
              <li>Al desactivar variantes, se eliminaran todas las variantes creadas</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Variant Dialog */}
      <VariantFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) setEditingVariant(null);
        }}
        onSubmit={editingVariant ? handleEditVariant : handleAddVariant}
        initialData={
          editingVariant
            ? {
                name: editingVariant.name,
                sku: editingVariant.sku,
                price: editingVariant.price,
                comparePrice: editingVariant.comparePrice || '',
                stock: editingVariant.stock,
                lowStockThreshold: editingVariant.lowStockThreshold,
                attributes: editingVariant.attributes,
              }
            : undefined
        }
        isLoading={addVariants.isPending || updateVariant.isPending}
        mode={editingVariant ? 'edit' : 'create'}
      />

      {/* Delete Variant Dialog */}
      <AlertDialog open={!!deletingVariant} onOpenChange={() => setDeletingVariant(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar variante</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que quieres eliminar la variante "{deletingVariant?.name}"? Esta
              accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVariant}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteVariant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Variants Dialog */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Desactivar variantes</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que quieres desactivar las variantes? Esto eliminara todas las
              variantes creadas ({variants.length} variantes). Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableVariants}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disableVariants.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desactivar y eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
