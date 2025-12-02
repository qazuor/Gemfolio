import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Bell, Globe, Image, Package, Search, Share2 } from 'lucide-react';

import {
  BrandingSettingsForm,
  GeneralSettingsForm,
  NotificationSettingsForm,
  SeoSettingsForm,
  ShippingSettingsForm,
  SocialSettingsForm,
} from '@/components/settings';
import { PageHeader } from '@/components/shared';
import { useAllSettings } from '@/hooks/use-settings';

export const Route = createFileRoute('/_dashboard/configuracion/')({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: settings, isLoading } = useAllSettings();

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Administra la configuración de tu tienda" />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Envío</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Redes</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Información básica de tu negocio</CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettingsForm initialData={settings?.general} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Personaliza la apariencia de tu tienda</CardDescription>
            </CardHeader>
            <CardContent>
              <BrandingSettingsForm initialData={settings?.branding} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Envío</CardTitle>
              <CardDescription>Configura las opciones de envío</CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingSettingsForm initialData={settings?.shipping} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>Optimización para motores de búsqueda</CardDescription>
            </CardHeader>
            <CardContent>
              <SeoSettingsForm initialData={settings?.seo} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Enlaces a tus perfiles en redes sociales</CardDescription>
            </CardHeader>
            <CardContent>
              <SocialSettingsForm initialData={settings?.social} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configura las notificaciones por email</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm initialData={settings?.notifications} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
