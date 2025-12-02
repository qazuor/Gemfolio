import { createFileRoute } from '@tanstack/react-router';

import { ProductForm } from '@/components/products/product-form';
import { PageHeader } from '@/components/shared';
import { useProduct } from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id')({
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-6" />
        <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div>
      <PageHeader title="Editar producto" description={product.name} />
      <ProductForm product={product} />
    </div>
  );
}
