import { createFileRoute } from '@tanstack/react-router';

import { BundleForm } from '@/components/bundles/bundle-form';
import { PageHeader } from '@/components/shared';
import { useBundle } from '@/hooks/use-bundles';

export const Route = createFileRoute('/_dashboard/bundles/$id')({
  component: EditBundlePage,
});

function EditBundlePage() {
  const { id } = Route.useParams();
  const { data: bundle, isLoading } = useBundle(id);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-6" />
        <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  if (!bundle) {
    return <div>Bundle no encontrado</div>;
  }

  return (
    <div>
      <PageHeader title="Editar bundle" description={bundle.name} />
      <BundleForm bundle={bundle} />
    </div>
  );
}
