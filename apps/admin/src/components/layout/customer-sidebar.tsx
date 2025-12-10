import { Link, useLocation } from '@tanstack/react-router';
import { Gift } from 'lucide-react';

import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';

export function CustomerSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { navigation, isCustomer } = usePermissions();

  const isActive = (href: string) => {
    if (href === '/mi-cuenta') {
      return pathname === '/mi-cuenta';
    }
    return pathname.startsWith(href);
  };

  // Solo mostrar para clientes
  if (!isCustomer) {
    return null;
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar-background lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/mi-cuenta" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Gift className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold">
            <span className="text-primary">Gem</span>folio
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Mi Cuenta
        </p>
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href!}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href!)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Mi Cuenta</p>
          <p className="text-xs text-muted-foreground">Gemfolio</p>
        </div>
      </div>
    </aside>
  );
}
