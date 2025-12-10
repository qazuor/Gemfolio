import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@gemfolio/ui';
import { Link, useLocation } from '@tanstack/react-router';
import { ChevronDown, Gift } from 'lucide-react';
import { useState } from 'react';

import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';

export function MobileSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { isMobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { navigation, isAdmin } = usePermissions();

  // Expandir automáticamente grupos que tienen hijos
  const groupsWithChildren = navigation
    .filter((item) => item.children && item.children.length > 0)
    .map((item) => item.name);

  const [expandedItems, setExpandedItems] = useState<string[]>(groupsWithChildren);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/mi-cuenta') return pathname === '/mi-cuenta' && pathname.split('/').length === 2;
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    closeMobileSidebar();
  };

  return (
    <Sheet open={isMobileSidebarOpen} onOpenChange={closeMobileSidebar}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">
              <span className="text-primary">Gem</span>folio
            </span>
          </SheetTitle>
        </SheetHeader>

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
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50'
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
                              onClick={handleLinkClick}
                              className={cn(
                                'block rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive(child.href)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-accent/50'
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
                    to={item.href!}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href!)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent/50'
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

        {isAdmin && (
          <div className="border-t p-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Gemfolio Admin</p>
              <p className="text-xs text-muted-foreground">v0.1.0</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
