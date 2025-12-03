import { Loader2 } from 'lucide-react';

interface PendingProps {
  message?: string;
}

export function Pending({ message = 'Cargando...' }: PendingProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function RootPending() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando aplicación...</p>
      </div>
    </div>
  );
}

export function TablePending() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-lg border">
      <div className="flex flex-col items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    </div>
  );
}
