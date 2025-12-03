import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/pedidos/$id/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/pedidos/$id/resumen', params: { id: params.id } });
  },
});
