import { createFileRoute, Link } from '@tanstack/react-router';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string | undefined,
  }),
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();

  if (!token) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-bold">
            <span className="text-primary">Gem</span>folio
          </h1>
          <p className="mt-2 text-muted-foreground">Enlace inválido</p>
        </div>
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            El enlace de recuperación es inválido o ha expirado.
          </p>
          <Link to="/forgot-password" className="inline-block text-sm text-primary hover:underline">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-bold">
          <span className="text-primary">Gem</span>folio
        </h1>
        <p className="mt-2 text-muted-foreground">Nueva contraseña</p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
