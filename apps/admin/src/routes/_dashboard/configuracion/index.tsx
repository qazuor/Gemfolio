import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/configuracion/')({
  beforeLoad: () => {
    throw redirect({ to: '/configuracion/general' });
  },
});
