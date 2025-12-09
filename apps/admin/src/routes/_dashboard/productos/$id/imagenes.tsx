import { useUploadThing } from '@gemfolio/storage';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { ImagePlus, Loader2, Star, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import {
  useAddProductImages,
  useDeleteProductImage,
  useProduct,
  useSetPrimaryImage,
} from '@/hooks/use-products';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_dashboard/productos/$id/imagenes')({
  component: ProductImagenesPage,
});

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

function ProductImagenesPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const addImages = useAddProductImages();
  const deleteImage = useDeleteProductImage();
  const setPrimaryImage = useSetPrimaryImage();

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const { startUpload, isUploading } = useUploadThing('productImage', {
    onUploadProgress: (progress) => {
      setUploadingFiles((prev) =>
        prev.map((uf) => ({
          ...uf,
          progress: Math.min(progress, 90),
        }))
      );
    },
    onClientUploadComplete: (res) => {
      // Add uploaded images to product
      const images = res.map((file, index) => ({
        url: file.ufsUrl,
        alt: file.name,
        order: (product?.images?.length || 0) + index,
        isPrimary: (product?.images?.length || 0) === 0 && index === 0,
      }));

      addImages.mutate(
        { productId: id, images },
        {
          onSuccess: () => {
            setUploadingFiles([]);
          },
          onError: () => {
            setUploadingFiles((prev) =>
              prev.map((uf) => ({
                ...uf,
                error: 'Error al guardar imagen',
              }))
            );
          },
        }
      );
    },
    onUploadError: (error) => {
      setUploadingFiles((prev) =>
        prev.map((uf) => ({
          ...uf,
          error: error.message || 'Error al subir archivo',
        }))
      );
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploadingFiles(acceptedFiles.map((file) => ({ file, progress: 0 })));
      await startUpload(acceptedFiles);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 10,
    maxSize: 8 * 1024 * 1024, // 8MB
    disabled: isUploading,
  });

  const removeUploadingFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = (imageId: string) => {
    deleteImage.mutate({ productId: id, imageId });
  };

  const handleSetPrimary = (imageId: string) => {
    setPrimaryImage.mutate({ productId: id, imageId });
  };

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
            <div
              {...getRootProps()}
              className={cn(
                'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50',
                isUploading && 'cursor-not-allowed opacity-50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">
                {isDragActive
                  ? 'Suelta las imagenes aqui...'
                  : 'Arrastra imagenes aqui o haz click para subir'}
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG o WEBP hasta 8MB</p>
              <Button variant="outline" className="mt-4" disabled={isUploading} type="button">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Seleccionar archivos
                  </>
                )}
              </Button>
            </div>

            {fileRejections.length > 0 && (
              <div className="mt-2 text-sm text-destructive">
                {fileRejections.map(({ file, errors }) => (
                  <div key={file.name}>
                    {file.name}: {errors.map((e) => e.message).join(', ')}
                  </div>
                ))}
              </div>
            )}

            {uploadingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadingFiles.map((uf, index) => (
                  <div
                    key={uf.file.name}
                    className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{uf.file.name}</p>
                      {uf.error ? (
                        <p className="text-xs text-destructive">{uf.error}</p>
                      ) : (
                        <Progress value={uf.progress} className="mt-1 h-1" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeUploadingFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleSetPrimary(image.id)}
                      disabled={setPrimaryImage.isPending}
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          image.isPrimary && 'fill-yellow-500 text-yellow-500'
                        )}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deleteImage.isPending}
                    >
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
