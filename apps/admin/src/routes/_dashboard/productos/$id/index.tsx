import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/productos/$id/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/productos/$id/info', params: { id: params.id } });
  },
});
