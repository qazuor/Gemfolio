import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
};

export default function LoginPage() {
  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold">
          <span className="text-primary">Gem</span>folio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inicia sesión para acceder al panel de administración
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Olvidaste tu contraseña?{' '}
        <Link href="/forgot-password" className="text-primary hover:underline">
          Recuperar
        </Link>
      </p>
    </div>
  );
}
