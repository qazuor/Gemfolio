import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { Breadcrumbs, CustomerSidebar, Header, MobileSidebar, Sidebar } from '@/components/layout';
import { ErrorComponent } from '@/components/shared/error-boundary';
import { NotFound } from '@/components/shared/not-found';
import { Pending } from '@/components/shared/pending';
import { getSessionServer } from '@/lib/auth.server';
import { getDefaultRouteForRole, isRouteAllowedForRole, type UserRole } from '@/lib/permissions';

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionServer();
    if (!session) {
      throw redirect({ to: '/login' });
    }

    const role = (session.user.role as UserRole) || 'customer';
    const pathname = location.pathname;

    // Verificar si el usuario puede acceder a esta ruta
    if (!isRouteAllowedForRole(pathname, role)) {
      // Redirigir a la ruta por defecto del rol
      const defaultRoute = getDefaultRouteForRole(role);
      throw redirect({ to: defaultRoute });
    }

    return { user: session.user, role };
  },
  component: DashboardLayout,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFound,
  pendingComponent: Pending,
});

function DashboardLayout() {
  return (
    <div className="flex min-h-screen lg:h-screen overflow-hidden">
      {/* Sidebar para admins */}
      <Sidebar />
      {/* Sidebar para clientes */}
      <CustomerSidebar />
      {/* Mobile sidebar (funciona para ambos roles) */}
      <MobileSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 lg:p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
