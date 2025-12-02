import { createFileRoute, Link } from '@tanstack/react-router';

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
      <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
        <p>
          ¿Olvidaste tu contraseña?{' '}
          <Link to="/forgot-password" className="text-primary hover:underline">
            Recuperar contraseña
          </Link>
        </p>
        <p>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
