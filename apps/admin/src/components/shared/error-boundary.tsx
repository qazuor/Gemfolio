import { Button } from '@gemfolio/ui';
import { useRouter } from '@tanstack/react-router';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface ErrorComponentProps {
  error: Error;
  reset?: () => void;
}

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">Algo salió mal</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'}
      </p>
      {process.env.NODE_ENV === 'development' && error.stack && (
        <pre className="mt-4 max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-left text-xs">
          {error.stack}
        </pre>
      )}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => router.navigate({ to: '/' })}>
          <Home className="mr-2 h-4 w-4" />
          Ir al inicio
        </Button>
        {reset && (
          <Button onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}

export function RootErrorComponent({ error }: { error: Error }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error | Gemfolio Admin</title>
      </head>
      <body className="flex min-h-screen items-center justify-center bg-background font-sans">
        <div className="text-center p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Error crítico</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Recargar página
          </button>
        </div>
      </body>
    </html>
  );
}
