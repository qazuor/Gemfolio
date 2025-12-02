import { Link, useMatches } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Map route paths to breadcrumb labels
const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/productos': 'Productos',
  '/productos/nuevo': 'Nuevo Producto',
  '/categorias': 'Categorías',
  '/bundles': 'Bundles',
  '/bundles/nuevo': 'Nuevo Bundle',
  '/pedidos': 'Pedidos',
  '/cupones': 'Cupones',
  '/cupones/nuevo': 'Nuevo Cupón',
  '/inventario': 'Inventario',
  '/clientes': 'Clientes',
  '/paginas': 'Páginas',
  '/paginas/nuevo': 'Nueva Página',
  '/configuracion': 'Configuración',
  '/configuracion/general': 'General',
  '/configuracion/branding': 'Branding',
  '/configuracion/envio': 'Envío',
  '/configuracion/notificaciones': 'Notificaciones',
  '/configuracion/seo': 'SEO',
};

export function Breadcrumbs() {
  const matches = useMatches();

  // Build breadcrumb items from route matches
  const breadcrumbs: BreadcrumbItem[] = [];

  for (const match of matches) {
    const path = match.pathname;

    // Skip root and layout routes
    if (path === '/' || !path || path === '/_dashboard') continue;

    // Check if we have a label for this path
    const label = routeLabels[path];
    if (label) {
      breadcrumbs.push({ label, href: path });
    } else if (path.includes('/')) {
      // Handle dynamic routes like /productos/[id]
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 1) {
        const lastSegment = segments[segments.length - 1];
        // Check if it's a dynamic segment (not in our static routes)
        if (!routeLabels[path]) {
          breadcrumbs.push({ label: `#${lastSegment.slice(0, 8)}...` });
        }
      }
    }
  }

  // If no breadcrumbs, we're on the dashboard
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {breadcrumbs.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {item.href && index < breadcrumbs.length - 1 ? (
              <Link to={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
