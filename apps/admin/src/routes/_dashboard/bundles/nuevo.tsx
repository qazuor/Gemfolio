import { createFileRoute } from '@tanstack/react-router';

import { BundleForm } from '@/components/bundles/bundle-form';
import { PageHeader } from '@/components/shared';

export const Route = createFileRoute('/_dashboard/bundles/nuevo')({
  component: NewBundlePage,
});

function NewBundlePage() {
  return (
    <div>
      <PageHeader title="Nuevo bundle" description="Crea un nuevo paquete de productos" />
      <BundleForm />
    </div>
  );
}
