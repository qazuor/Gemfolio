import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const priceVariants = cva('font-semibold', {
  variants: {
    size: {
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg',
      xl: 'text-2xl',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface PriceProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof priceVariants> {
  value: number;
  compareValue?: number;
  currency?: string;
  locale?: string;
}

function Price({
  value,
  compareValue,
  currency = 'ARS',
  locale = 'es-AR',
  size,
  className,
  ...props
}: PriceProps) {
  const formatter = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [locale, currency]
  );

  const formattedPrice = formatter.format(value);
  const formattedComparePrice = compareValue ? formatter.format(compareValue) : null;

  const hasDiscount = compareValue && compareValue > value;

  return (
    <span className={cn('inline-flex items-baseline gap-2', className)} {...props}>
      <span className={cn(priceVariants({ size }), hasDiscount && 'text-destructive')}>
        {formattedPrice}
      </span>
      {hasDiscount && formattedComparePrice && (
        <span className="text-sm text-muted-foreground line-through">{formattedComparePrice}</span>
      )}
    </span>
  );
}

export { Price, priceVariants };
