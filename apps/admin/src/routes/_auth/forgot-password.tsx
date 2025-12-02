import { createFileRoute, Link } from '@tanstack/react-router';

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-bold">
          <span className="text-primary">Gem</span>folio
        </h1>
        <p className="mt-2 text-muted-foreground">Recuperar contraseña</p>
      </div>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Recordaste tu contraseña?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
