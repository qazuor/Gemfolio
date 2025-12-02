import { Button, Skeleton } from '@gemfolio/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileText } from 'lucide-react';

import { PageForm } from '@/components/pages/PageForm';
import { PageHeader } from '@/components/shared';
import { type PageFormData, usePage, useUpdatePage } from '@/hooks/use-pages';

export const Route = createFileRoute('/_dashboard/paginas/$id')({
  component: EditPagePage,
});

function EditPagePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: page, isLoading } = usePage(id);
  const updatePage = useUpdatePage();

  const handleSubmit = (data: PageFormData) => {
    updatePage.mutate(
      { id, data },
      {
        onSuccess: () => {
          navigate({ to: '/paginas' });
        },
      }
    );
  };

  if (isLoading) {
    return <PageEditorSkeleton />;
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Página no encontrada</h2>
        <p className="text-muted-foreground">La página que buscas no existe</p>
        <Button asChild className="mt-4">
          <Link to="/paginas">Volver a páginas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/paginas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={`Editar: ${page.title}`} description={`/${page.slug}`} />
      </div>

      <PageForm page={page} onSubmit={handleSubmit} isLoading={updatePage.isPending} />
    </div>
  );
}

function PageEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <div>
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    </div>
  );
}
