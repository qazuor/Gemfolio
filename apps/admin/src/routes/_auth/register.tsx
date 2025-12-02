import { createFileRoute, Link } from '@tanstack/react-router';

import { RegisterForm } from '@/components/auth/register-form';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-bold">
          <span className="text-primary">Gem</span>folio
        </h1>
        <p className="mt-2 text-muted-foreground">Crear cuenta de administrador</p>
      </div>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
