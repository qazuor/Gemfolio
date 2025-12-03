import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';

import { SeoSettingsForm } from '@/components/settings';
import { useAllSettings } from '@/hooks/use-settings';

export const Route = createFileRoute('/_dashboard/configuracion/seo')({
  component: SeoSettingsPage,
});

function SeoSettingsPage() {
  const { data: settings, isLoading } = useAllSettings();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
        <CardDescription>Optimizacion para motores de busqueda</CardDescription>
      </CardHeader>
      <CardContent>
        <SeoSettingsForm initialData={settings?.seo} />
      </CardContent>
    </Card>
  );
}
