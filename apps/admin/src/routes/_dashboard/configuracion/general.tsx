import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';

import { GeneralSettingsForm } from '@/components/settings';
import { useAllSettings } from '@/hooks/use-settings';

export const Route = createFileRoute('/_dashboard/configuracion/general')({
  component: GeneralSettingsPage,
});

function GeneralSettingsPage() {
  const { data: settings, isLoading } = useAllSettings();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracion General</CardTitle>
        <CardDescription>Informacion basica de tu negocio</CardDescription>
      </CardHeader>
      <CardContent>
        <GeneralSettingsForm initialData={settings?.general} />
      </CardContent>
    </Card>
  );
}
