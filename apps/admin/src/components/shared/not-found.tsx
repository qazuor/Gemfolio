import { Button } from '@gemfolio/ui';
import { Link, type NotFoundRouteProps } from '@tanstack/react-router';
import { FileQuestion, Home } from 'lucide-react';

export function NotFound(_props: NotFoundRouteProps) {
  const title = 'Página no encontrada';
  const description = 'La página que buscas no existe o ha sido movida.';
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <Button asChild className="mt-6">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>
    </div>
  );
}

export function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mt-8 text-4xl font-bold">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-muted-foreground">Página no encontrada</h2>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        La página que buscas no existe o ha sido movida.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>
    </div>
  );
}
