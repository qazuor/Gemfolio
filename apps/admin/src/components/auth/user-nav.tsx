import { signOut, useSession } from '@gemfolio/auth/client';
import { Badge } from '@gemfolio/ui';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Settings, Ticket, User } from 'lucide-react';
import { useState } from 'react';

import { usePermissions } from '@/hooks/use-permissions';
import { getRoleColor, getRoleLabel, type UserProfile } from '@/hooks/use-profile';

export function UserNav() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { isAdmin, can } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user;
  const userWithRole = user as (typeof user & { role?: string }) | undefined;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await signOut();
      navigate({ to: '/login' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleNavigateToProfile = () => {
    setIsOpen(false);
    if (isAdmin) {
      navigate({ to: '/perfil' });
    } else {
      navigate({ to: '/mi-cuenta' });
    }
  };

  const handleNavigateToOrders = () => {
    setIsOpen(false);
    navigate({ to: '/mi-cuenta/pedidos' });
  };

  const handleNavigateToSettings = () => {
    setIsOpen(false);
    navigate({ to: '/configuracion/general' });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {initials}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            tabIndex={-1}
            aria-label="Close menu"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-popover p-1 shadow-lg">
            <div className="border-b px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                {userWithRole?.role && (
                  <Badge variant={getRoleColor(userWithRole.role as UserProfile['role'])}>
                    {getRoleLabel(userWithRole.role as UserProfile['role'])}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                type="button"
                onClick={handleNavigateToProfile}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <User className="h-4 w-4" />
                Mi Perfil
              </button>

              {/* Mostrar "Mis Pedidos" solo para clientes */}
              {!isAdmin && can('orders:view_own') && (
                <button
                  type="button"
                  onClick={handleNavigateToOrders}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <Ticket className="h-4 w-4" />
                  Mis Pedidos
                </button>
              )}

              {/* Mostrar "Configuración" solo para admins */}
              {can('settings:view') && (
                <button
                  type="button"
                  onClick={handleNavigateToSettings}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </button>
              )}
            </div>
            <div className="border-t py-1">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
