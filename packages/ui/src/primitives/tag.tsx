import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/utils';

const tagVariants = cva('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium', {
  variants: {
    variant: {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      sale: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      featured: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      exclusive: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  label?: string;
}

function Tag({ variant, label, className, children, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant }), className)} {...props}>
      {label ?? children}
    </span>
  );
}

export { Tag, tagVariants };
