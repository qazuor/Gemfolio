import {
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
import { Edit, Plus, Trash2 } from 'lucide-react';

import { useProduct } from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id/variantes')({
  component: ProductVariantesPage,
});

function ProductVariantesPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!product) {
    return null;
  }

  const variants = product.variants || [];
  const hasVariants = product.hasVariants;

  const formatCurrency = (value: string | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(value));
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar variante
            </Button>
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
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Activar variantes
              </Button>
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay variantes creadas</p>
              <p className="text-sm">Agrega variantes para ofrecer diferentes opciones</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.name || 'Sin nombre'}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {variant.sku || '-'}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      {variant.price ? (
                        formatCurrency(variant.price)
                      ) : (
                        <span className="text-muted-foreground">Precio base</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          variant.stock > 5
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
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
            <CardTitle>Opciones de variantes</CardTitle>
            <CardDescription>Define los atributos que diferencian tus variantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <p>Proximamente: Configuracion de opciones de variantes</p>
              <p className="text-sm">(Color, Talla, Material, etc.)</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
