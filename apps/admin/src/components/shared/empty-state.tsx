import { Button } from '@gemfolio/ui';
import type { LucideIcon } from 'lucide-react';
import { Package } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[250px] sm:min-h-[350px] flex-col items-center justify-center rounded-lg border border-dashed p-4 sm:p-8 text-center">
      <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground px-2">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4 sm:mt-6">
          {action.label}
        </Button>
      )}
      {children && <div className="mt-4 sm:mt-6">{children}</div>}
    </div>
  );
}
