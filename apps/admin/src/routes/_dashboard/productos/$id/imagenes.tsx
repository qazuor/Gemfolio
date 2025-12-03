import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { GripVertical, ImagePlus, Star, Trash2, Upload } from 'lucide-react';

import { useProduct } from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id/imagenes')({
  component: ProductImagenesPage,
});

function ProductImagenesPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!product) {
    return null;
  }

  const images = product.images || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imagenes del producto</CardTitle>
          <CardDescription>
            Sube imagenes de tu producto. La primera imagen sera la principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upload Zone */}
          <div className="mb-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">
                Arrastra imagenes aqui o haz click para subir
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG o WEBP hasta 5MB</p>
              <Button variant="outline" className="mt-4">
                <ImagePlus className="mr-2 h-4 w-4" />
                Seleccionar archivos
              </Button>
            </div>
          </div>

          {/* Images Grid */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative aspect-square rounded-lg border overflow-hidden bg-muted"
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Imagen ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Star
                        className={`h-4 w-4 ${image.isPrimary ? 'fill-yellow-500 text-yellow-500' : ''}`}
                      />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-yellow-950 text-xs font-medium px-2 py-1 rounded">
                      Principal
                    </div>
                  )}

                  {/* Order Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImagePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay imagenes para este producto</p>
              <p className="text-sm">Sube imagenes para mostrar tu producto</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consejos para imagenes</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ul className="text-muted-foreground space-y-2">
            <li>Usa imagenes de alta calidad (minimo 800x800 pixeles)</li>
            <li>Muestra el producto desde diferentes angulos</li>
            <li>Usa fondo blanco o neutro para mejor visibilidad</li>
            <li>Incluye imagenes de detalles importantes</li>
            <li>La primera imagen aparecera en listados y busquedas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
