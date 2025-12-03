import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';

import { SocialSettingsForm } from '@/components/settings';
import { useAllSettings } from '@/hooks/use-settings';

export const Route = createFileRoute('/_dashboard/configuracion/redes')({
  component: SocialSettingsPage,
});

function SocialSettingsPage() {
  const { data: settings, isLoading } = useAllSettings();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redes Sociales</CardTitle>
        <CardDescription>Enlaces a tus perfiles en redes sociales</CardDescription>
      </CardHeader>
      <CardContent>
        <SocialSettingsForm initialData={settings?.social} />
      </CardContent>
    </Card>
  );
}
