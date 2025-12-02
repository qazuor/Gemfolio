import { Button } from '@gemfolio/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { PageForm } from '@/components/pages/PageForm';
import { PageHeader } from '@/components/shared';
import { type PageFormData, useCreatePage } from '@/hooks/use-pages';

export const Route = createFileRoute('/_dashboard/paginas/nuevo')({
  component: NewPagePage,
});

function NewPagePage() {
  const navigate = useNavigate();
  const createPage = useCreatePage();

  const handleSubmit = (data: PageFormData) => {
    createPage.mutate(data, {
      onSuccess: () => {
        navigate({ to: '/paginas' });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/paginas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Nueva página" description="Crea una nueva página de contenido" />
      </div>

      <PageForm onSubmit={handleSubmit} isLoading={createPage.isPending} />
    </div>
  );
}
