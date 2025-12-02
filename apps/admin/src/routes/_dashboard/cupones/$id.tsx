import { Button, Skeleton } from '@gemfolio/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Tag } from 'lucide-react';

import { CouponForm } from '@/components/coupons';
import { PageHeader } from '@/components/shared';
import { useCoupon } from '@/hooks/use-coupons';

export const Route = createFileRoute('/_dashboard/cupones/$id')({
  component: EditCouponPage,
});

function EditCouponPage() {
  const { id } = Route.useParams();
  const { data: coupon, isLoading } = useCoupon(id);

  if (isLoading) {
    return <EditCouponSkeleton />;
  }

  if (!coupon) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Tag className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Cupón no encontrado</h2>
        <p className="text-muted-foreground">El cupón que buscas no existe</p>
        <Button asChild className="mt-4">
          <Link to="/cupones">Volver a cupones</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/cupones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={`Editar cupón: ${coupon.code}`}
          description="Modifica los datos del cupón"
        />
      </div>

      <CouponForm coupon={coupon} />
    </div>
  );
}

function EditCouponSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}
