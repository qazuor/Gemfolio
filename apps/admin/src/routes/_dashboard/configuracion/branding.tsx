import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';

import { BrandingSettingsForm } from '@/components/settings';
import { useAllSettings } from '@/hooks/use-settings';

export const Route = createFileRoute('/_dashboard/configuracion/branding')({
  component: BrandingSettingsPage,
});

function BrandingSettingsPage() {
  const { data: settings, isLoading } = useAllSettings();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>Personaliza la apariencia de tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        <BrandingSettingsForm initialData={settings?.branding} />
      </CardContent>
    </Card>
  );
}
