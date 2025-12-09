import { authClient } from '@gemfolio/auth/client';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { Breadcrumbs, Header, MobileSidebar, Sidebar } from '@/components/layout';
import { ErrorComponent } from '@/components/shared/error-boundary';
import { NotFound } from '@/components/shared/not-found';
import { Pending } from '@/components/shared/pending';

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/login' });
    }
    return { user: session.data.user };
  },
  component: DashboardLayout,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFound,
  pendingComponent: Pending,
});

function DashboardLayout() {
  return (
    <div className="flex min-h-screen lg:h-screen overflow-hidden">
      <Sidebar />
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
