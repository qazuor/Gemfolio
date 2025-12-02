import { forgetPassword } from '@gemfolio/auth/client';
import { Loader2, Mail } from 'lucide-react';
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use Better Auth's forgetPassword endpoint
      const result = await forgetPassword({
        email,
        redirectTo: '/reset-password',
      });

      if (result.error) {
        setError(result.error.message || 'Error al enviar el correo de recuperación');
        return;
      }

      setIsSuccess(true);
    } catch (_err) {
      setError('Error al enviar el correo. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Revisa tu correo</h3>
          <p className="text-sm text-muted-foreground">
            Te hemos enviado un enlace de recuperación a{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gemfolio.com"
            required
            disabled={isLoading}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </span>
          ) : (
            'Enviar enlace de recuperación'
          )}
        </button>
      </form>
    </div>
  );
}
