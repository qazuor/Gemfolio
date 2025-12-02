import { createFileRoute } from '@tanstack/react-router';

import { ProductForm } from '@/components/products/product-form';
import { PageHeader } from '@/components/shared';

export const Route = createFileRoute('/_dashboard/productos/nuevo')({
  component: NewProductPage,
});

function NewProductPage() {
  return (
    <div>
      <PageHeader title="Nuevo producto" description="Crea un nuevo producto para tu catálogo" />
      <ProductForm />
    </div>
  );
}
