import { authClient } from '@gemfolio/auth/client';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/login' });
    }
    return { user: session.data.user };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
