import type { LucideIcon } from 'lucide-react';
import {
  Boxes,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Ticket,
  User,
  Users,
} from 'lucide-react';

// Tipos de roles disponibles
export type UserRole = 'customer' | 'admin' | 'super_admin';

// Permisos disponibles en el sistema
export type Permission =
  | 'dashboard:view'
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'categories:view'
  | 'categories:create'
  | 'categories:edit'
  | 'categories:delete'
  | 'bundles:view'
  | 'bundles:create'
  | 'bundles:edit'
  | 'bundles:delete'
  | 'orders:view'
  | 'orders:view_own'
  | 'orders:edit'
  | 'orders:delete'
  | 'coupons:view'
  | 'coupons:create'
  | 'coupons:edit'
  | 'coupons:delete'
  | 'inventory:view'
  | 'inventory:edit'
  | 'customers:view'
  | 'customers:edit'
  | 'customers:delete'
  | 'pages:view'
  | 'pages:create'
  | 'pages:edit'
  | 'pages:delete'
  | 'reviews:view'
  | 'reviews:moderate'
  | 'reviews:delete'
  | 'abandoned_carts:view'
  | 'abandoned_carts:manage'
  | 'settings:view'
  | 'settings:edit'
  | 'profile:view'
  | 'profile:edit';

// Configuración de permisos por rol
export const rolePermissions: Record<UserRole, Permission[]> = {
  customer: ['profile:view', 'profile:edit', 'orders:view_own'],
  admin: [
    'dashboard:view',
    'products:view',
    'products:create',
    'products:edit',
    'categories:view',
    'categories:create',
    'categories:edit',
    'bundles:view',
    'bundles:create',
    'bundles:edit',
    'orders:view',
    'orders:view_own',
    'orders:edit',
    'coupons:view',
    'coupons:create',
    'coupons:edit',
    'inventory:view',
    'inventory:edit',
    'customers:view',
    'pages:view',
    'pages:create',
    'pages:edit',
    'reviews:view',
    'reviews:moderate',
    'abandoned_carts:view',
    'settings:view',
    'profile:view',
    'profile:edit',
  ],
  super_admin: [
    'dashboard:view',
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    'categories:view',
    'categories:create',
    'categories:edit',
    'categories:delete',
    'bundles:view',
    'bundles:create',
    'bundles:edit',
    'bundles:delete',
    'orders:view',
    'orders:view_own',
    'orders:edit',
    'orders:delete',
    'coupons:view',
    'coupons:create',
    'coupons:edit',
    'coupons:delete',
    'inventory:view',
    'inventory:edit',
    'customers:view',
    'customers:edit',
    'customers:delete',
    'pages:view',
    'pages:create',
    'pages:edit',
    'pages:delete',
    'reviews:view',
    'reviews:moderate',
    'reviews:delete',
    'abandoned_carts:view',
    'abandoned_carts:manage',
    'settings:view',
    'settings:edit',
    'profile:view',
    'profile:edit',
  ],
};

// Verificar si un rol tiene un permiso específico
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Verificar si un rol tiene alguno de los permisos
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

// Verificar si un rol tiene todos los permisos
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

// Verificar si es un rol de administrador (admin o super_admin)
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

// Tipo para items de navegación
export interface NavigationChild {
  name: string;
  href: string;
  permissions: Permission[];
}

export interface NavigationItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  permissions: Permission[];
  children?: NavigationChild[];
}

// Configuración de navegación para administradores
export const adminNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    permissions: ['dashboard:view'],
  },
  {
    name: 'Catálogo',
    icon: Package,
    permissions: ['products:view', 'categories:view', 'bundles:view'],
    children: [
      { name: 'Productos', href: '/productos', permissions: ['products:view'] },
      { name: 'Categorías', href: '/categorias', permissions: ['categories:view'] },
      { name: 'Bundles', href: '/bundles', permissions: ['bundles:view'] },
    ],
  },
  {
    name: 'Ventas',
    icon: ShoppingCart,
    permissions: ['orders:view', 'coupons:view', 'abandoned_carts:view'],
    children: [
      { name: 'Pedidos', href: '/pedidos', permissions: ['orders:view'] },
      { name: 'Cupones', href: '/cupones', permissions: ['coupons:view'] },
      {
        name: 'Carritos abandonados',
        href: '/carritos-abandonados',
        permissions: ['abandoned_carts:view'],
      },
    ],
  },
  {
    name: 'Inventario',
    href: '/inventario',
    icon: Boxes,
    permissions: ['inventory:view'],
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
    permissions: ['customers:view'],
  },
  {
    name: 'Reseñas',
    href: '/resenas',
    icon: MessageSquare,
    permissions: ['reviews:view'],
  },
  {
    name: 'Páginas',
    href: '/paginas',
    icon: FileText,
    permissions: ['pages:view'],
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    permissions: ['settings:view'],
  },
];

// Configuración de navegación para clientes
export const customerNavigation: NavigationItem[] = [
  {
    name: 'Mi Perfil',
    href: '/mi-cuenta',
    icon: User,
    permissions: ['profile:view'],
  },
  {
    name: 'Mis Pedidos',
    href: '/mi-cuenta/pedidos',
    icon: Ticket,
    permissions: ['orders:view_own'],
  },
];

// Filtrar navegación según permisos del usuario
export function filterNavigationByRole(
  navigation: NavigationItem[],
  role: UserRole
): NavigationItem[] {
  return navigation
    .filter((item) => hasAnyPermission(role, item.permissions))
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          hasAnyPermission(role, child.permissions)
        );
        // Solo incluir el item padre si tiene hijos visibles
        if (filteredChildren.length === 0) {
          return null;
        }
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter((item): item is NavigationItem => item !== null);
}

// Obtener la navegación según el rol
export function getNavigationForRole(role: UserRole): NavigationItem[] {
  if (isAdminRole(role)) {
    return filterNavigationByRole(adminNavigation, role);
  }
  return filterNavigationByRole(customerNavigation, role);
}

// Obtener la ruta inicial según el rol
export function getDefaultRouteForRole(role: UserRole): string {
  if (isAdminRole(role)) {
    return '/';
  }
  return '/mi-cuenta';
}

// Verificar si una ruta está permitida para un rol
export function isRouteAllowedForRole(pathname: string, role: UserRole): boolean {
  // Rutas de cliente
  if (pathname.startsWith('/mi-cuenta')) {
    return hasPermission(role, 'profile:view');
  }

  // Rutas de admin
  const routePermissions: Record<string, Permission[]> = {
    '/': ['dashboard:view'],
    '/productos': ['products:view'],
    '/categorias': ['categories:view'],
    '/bundles': ['bundles:view'],
    '/pedidos': ['orders:view'],
    '/cupones': ['coupons:view'],
    '/carritos-abandonados': ['abandoned_carts:view'],
    '/inventario': ['inventory:view'],
    '/clientes': ['customers:view'],
    '/resenas': ['reviews:view'],
    '/paginas': ['pages:view'],
    '/configuracion': ['settings:view'],
    '/perfil': ['profile:view'],
  };

  // Buscar la ruta que coincida
  for (const [route, permissions] of Object.entries(routePermissions)) {
    if (pathname === route || (route !== '/' && pathname.startsWith(route))) {
      return hasAnyPermission(role, permissions);
    }
  }

  // Por defecto, permitir si es admin
  return isAdminRole(role);
}
