import { Button, Skeleton } from '@gemfolio/ui';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { ArrowLeft, Box, DollarSign, FileText, Image, Package, Search } from 'lucide-react';

import { PageHeader } from '@/components/shared';
import { useProduct } from '@/hooks/use-products';

export const Route = createFileRoute('/_dashboard/productos/$id')({
  component: ProductLayout,
});

const tabs = [
  { path: 'info', label: 'Informacion', icon: FileText },
  { path: 'precios', label: 'Precios', icon: DollarSign },
  { path: 'inventario', label: 'Inventario', icon: Package },
  { path: 'imagenes', label: 'Imagenes', icon: Image },
  { path: 'variantes', label: 'Variantes', icon: Box },
  { path: 'seo', label: 'SEO', icon: Search },
];

function ProductLayout() {
  const { id } = Route.useParams();
  const location = useLocation();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return <ProductLayoutSkeleton />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Producto no encontrado</h2>
        <p className="text-muted-foreground">El producto que buscas no existe</p>
        <Button asChild className="mt-4">
          <Link to="/productos">Volver a productos</Link>
        </Button>
      </div>
    );
  }

  // Determine active tab from current path
  const currentTab = location.pathname.split('/').pop() || 'info';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Editar producto" description={product.name} />
      </div>

      {/* Tab Navigation */}
      <nav className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={`/productos/$id/${tab.path}` as '/productos/$id/info'}
              params={{ id }}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Child Route Content */}
      <Outlet />
    </div>
  );
}

function ProductLayoutSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
