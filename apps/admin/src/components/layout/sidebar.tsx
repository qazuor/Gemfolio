import { Link, useLocation } from '@tanstack/react-router';
import {
  Boxes,
  ChevronDown,
  FileText,
  Gift,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Catálogo',
    icon: Package,
    children: [
      { name: 'Productos', href: '/productos' },
      { name: 'Categorías', href: '/categorias' },
      { name: 'Bundles', href: '/bundles' },
    ],
  },
  {
    name: 'Ventas',
    icon: ShoppingCart,
    children: [
      { name: 'Pedidos', href: '/pedidos' },
      { name: 'Cupones', href: '/cupones' },
    ],
  },
  {
    name: 'Inventario',
    href: '/inventario',
    icon: Boxes,
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    name: 'Páginas',
    href: '/paginas',
    icon: FileText,
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [expandedItems, setExpandedItems] = useState<string[]>(['Catálogo', 'Ventas']);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar-background lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Gift className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold">
            <span className="text-primary">Gem</span>folio
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      expandedItems.includes(item.name)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        expandedItems.includes(item.name) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedItems.includes(item.name) && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            to={child.href}
                            className={cn(
                              'block rounded-lg px-3 py-2 text-sm transition-colors',
                              isActive(child.href)
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                            )}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Gemfolio Admin</p>
          <p className="text-xs text-muted-foreground">v0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
