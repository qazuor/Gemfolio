import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

export function SkeletonText({ className }: SkeletonProps) {
  return <div className={cn('skeleton-text', className)} />;
}

export function SkeletonAvatar({ className }: SkeletonProps) {
  return <div className={cn('skeleton-avatar', className)} />;
}

export function SkeletonImage({ className }: SkeletonProps) {
  return <div className={cn('skeleton-image', className)} />;
}

interface ProductSkeletonProps {
  className?: string;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <SkeletonImage />
      <div className="space-y-2">
        <SkeletonText className="w-2/3" />
        <SkeletonText className="w-1/3" />
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function ProductGridSkeleton({ count = 8, columns = 4 }: ProductGridSkeletonProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4 md:gap-6', gridCols[columns])}>
      {Array.from({ length: count }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton placeholders don't reorder
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <Skeleton className="h-20 w-20 shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/4" />
        <SkeletonText className="w-1/2" />
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SkeletonText className="w-1/4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-4">
        <SkeletonText className="w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
