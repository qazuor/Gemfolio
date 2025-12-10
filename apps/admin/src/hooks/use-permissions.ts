import { useSession } from '@gemfolio/auth/client';
import { useMemo } from 'react';

import {
  getDefaultRouteForRole,
  getNavigationForRole,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isAdminRole,
  isRouteAllowedForRole,
  type Permission,
  type UserRole,
} from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  // Better auth stores role as additional field on the user object
  // We need to cast to access the role property
  const user = session?.user;
  const userWithRole = user as (typeof user & { role?: string }) | undefined;
  const role = (userWithRole?.role as UserRole) ?? 'customer';

  const permissions = useMemo(() => {
    return {
      role,
      isAdmin: isAdminRole(role),
      isCustomer: role === 'customer',
      isSuperAdmin: role === 'super_admin',

      // Verificar permisos
      can: (permission: Permission) => hasPermission(role, permission),
      canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
      canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),

      // Navegación
      navigation: getNavigationForRole(role),
      defaultRoute: getDefaultRouteForRole(role),

      // Verificar rutas
      canAccessRoute: (pathname: string) => isRouteAllowedForRole(pathname, role),
    };
  }, [role]);

  return permissions;
}

// Hook para verificar un permiso específico
export function useHasPermission(permission: Permission): boolean {
  const { can } = usePermissions();
  return can(permission);
}

// Hook para verificar si puede acceder a una ruta
export function useCanAccessRoute(pathname: string): boolean {
  const { canAccessRoute } = usePermissions();
  return canAccessRoute(pathname);
}
