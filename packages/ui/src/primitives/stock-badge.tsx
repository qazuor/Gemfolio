import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/utils';

const stockBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        inStock: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        lowStock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        outOfStock: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      },
    },
    defaultVariants: {
      status: 'inStock',
    },
  }
);

export interface StockBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof stockBadgeVariants> {
  stock: number;
  lowStockThreshold?: number;
  labels?: {
    inStock?: string;
    lowStock?: string;
    outOfStock?: string;
  };
}

function StockBadge({
  stock,
  lowStockThreshold = 5,
  labels = {
    inStock: 'En stock',
    lowStock: 'Pocas unidades',
    outOfStock: 'Agotado',
  },
  className,
  ...props
}: StockBadgeProps) {
  const status: 'inStock' | 'lowStock' | 'outOfStock' =
    stock <= 0 ? 'outOfStock' : stock <= lowStockThreshold ? 'lowStock' : 'inStock';

  const label =
    status === 'outOfStock'
      ? labels.outOfStock
      : status === 'lowStock'
        ? labels.lowStock
        : labels.inStock;

  return (
    <span className={cn(stockBadgeVariants({ status }), className)} {...props}>
      {label}
    </span>
  );
}

export { StockBadge, stockBadgeVariants };
