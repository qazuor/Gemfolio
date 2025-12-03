import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';

import { ShippingSettingsForm } from '@/components/settings';
import { useAllSettings } from '@/hooks/use-settings';

export const Route = createFileRoute('/_dashboard/configuracion/envio')({
  component: ShippingSettingsPage,
});

function ShippingSettingsPage() {
  const { data: settings, isLoading } = useAllSettings();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envio</CardTitle>
        <CardDescription>Configura las opciones de envio</CardDescription>
      </CardHeader>
      <CardContent>
        <ShippingSettingsForm initialData={settings?.shipping} />
      </CardContent>
    </Card>
  );
}
