import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '@/components/auth/login-form';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-bold">
          <span className="text-primary">Gem</span>folio
        </h1>
        <p className="mt-2 text-muted-foreground">Iniciar Sesión</p>
      </div>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Olvidaste tu contraseña?{' '}
        <a href="/forgot-password" className="text-primary hover:underline">
          Recuperar contraseña
        </a>
      </p>
    </div>
  );
}
