import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Bell, Globe, Image, Package, Search, Share2 } from 'lucide-react';

import { PageHeader } from '@/components/shared';

export const Route = createFileRoute('/_dashboard/configuracion')({
  component: ConfiguracionLayout,
});

const tabs = [
  { path: '/configuracion/general', label: 'General', icon: Globe },
  { path: '/configuracion/branding', label: 'Branding', icon: Image },
  { path: '/configuracion/envio', label: 'Envio', icon: Package },
  { path: '/configuracion/seo', label: 'SEO', icon: Search },
  { path: '/configuracion/redes', label: 'Redes', icon: Share2 },
  { path: '/configuracion/notificaciones', label: 'Notificaciones', icon: Bell },
];

function ConfiguracionLayout() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader title="Configuracion" description="Administra la configuracion de tu tienda" />

      <nav className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
