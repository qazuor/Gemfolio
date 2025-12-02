import { Button } from '@gemfolio/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { CouponForm } from '@/components/coupons';
import { PageHeader } from '@/components/shared';

export const Route = createFileRoute('/_dashboard/cupones/nuevo')({
  component: NewCouponPage,
});

function NewCouponPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/cupones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Nuevo cupón" description="Crea un nuevo cupón de descuento" />
      </div>

      <CouponForm />
    </div>
  );
}
