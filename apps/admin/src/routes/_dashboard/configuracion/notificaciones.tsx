import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';

import { NotificationSettingsForm } from '@/components/settings';
import { useAllSettings } from '@/hooks/use-settings';

export const Route = createFileRoute('/_dashboard/configuracion/notificaciones')({
  component: NotificationSettingsPage,
});

function NotificationSettingsPage() {
  const { data: settings, isLoading } = useAllSettings();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
        <CardDescription>Configura las notificaciones por email</CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationSettingsForm initialData={settings?.notifications} />
      </CardContent>
    </Card>
  );
}
