import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@gemfolio/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { zodValidator } from '@tanstack/zod-adapter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Copy, Edit, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog, DataTable, EmptyState, PageHeader } from '@/components/shared';
import {
  type Coupon,
  formatCouponValue,
  getCouponStatus,
  getCouponTypeLabel,
  useCoupons,
  useDeleteCoupon,
  useToggleCouponStatus,
} from '@/hooks/use-coupons';
import { type CouponsSearch, couponsSearchSchema } from '@/lib/search-schemas';

export const Route = createFileRoute('/_dashboard/cupones/')({
  component: CouponsPage,
  validateSearch: zodValidator(couponsSearchSchema),
});

function CouponsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { search, isActive, type, page } = Route.useSearch();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const updateSearch = (updates: Partial<CouponsSearch>) => {
    navigate({
      search: (prev: CouponsSearch) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const { data: couponsData, isLoading } = useCoupons({
    page: page ?? 1,
    limit: 20,
    search: search || undefined,
    isActive: isActive,
    type: type || undefined,
  });

  const deleteCoupon = useDeleteCoupon();
  const toggleStatus = useToggleCouponStatus();

  const handleDelete = () => {
    if (deleteId) {
      deleteCoupon.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: 'code',
      header: 'Código',
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <div>
            <p className="font-mono font-medium">{coupon.code}</p>
            {coupon.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {coupon.description}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => getCouponTypeLabel(row.original.type),
    },
    {
      accessorKey: 'value',
      header: 'Valor',
      cell: ({ row }) => <span className="font-medium">{formatCouponValue(row.original)}</span>,
    },
    {
      accessorKey: 'usage',
      header: 'Uso',
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <span>
            {coupon.usageCount}
            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
          </span>
        );
      },
    },
    {
      accessorKey: 'validity',
      header: 'Vigencia',
      cell: ({ row }) => {
        const coupon = row.original;
        if (!coupon.validFrom && !coupon.validUntil) {
          return <span className="text-muted-foreground">Sin límite</span>;
        }
        return (
          <div className="text-xs">
            {coupon.validFrom && (
              <p>Desde: {format(new Date(coupon.validFrom), 'dd/MM/yyyy', { locale: es })}</p>
            )}
            {coupon.validUntil && (
              <p>Hasta: {format(new Date(coupon.validUntil), 'dd/MM/yyyy', { locale: es })}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = getCouponStatus(row.original);
        return <Badge variant={status.color}>{status.label}</Badge>;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Activo',
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <Switch
            checked={coupon.isActive}
            onCheckedChange={() => toggleStatus.mutate(coupon.id)}
            disabled={toggleStatus.isPending}
          />
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/cupones/$id" params={{ id: coupon.id }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(coupon.code);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar código
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(coupon.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cupones"
        description="Gestiona los cupones de descuento"
        actions={
          <Button asChild>
            <Link to="/cupones/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cupón
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código..."
            value={search ?? ''}
            onChange={(e) => updateSearch({ search: e.target.value || undefined })}
            className="pl-9"
          />
        </div>
        <Select
          value={isActive === true ? 'active' : isActive === false ? 'inactive' : ''}
          onValueChange={(value) =>
            updateSearch({
              isActive: value === 'active' ? true : value === 'inactive' ? false : undefined,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={type ?? ''}
          onValueChange={(value) =>
            updateSearch({
              type:
                value === 'all' ? undefined : (value as 'percentage' | 'fixed' | 'free_shipping'),
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="percentage">Porcentaje</SelectItem>
            <SelectItem value="fixed">Monto fijo</SelectItem>
            <SelectItem value="free_shipping">Envío gratis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {couponsData?.data.length === 0 && !isLoading ? (
        <EmptyState
          title="No hay cupones"
          description="Crea tu primer cupón de descuento"
          action={{
            label: 'Crear cupón',
            onClick: () => {},
          }}
        />
      ) : (
        <DataTable columns={columns} data={couponsData?.data || []} isLoading={isLoading} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar cupón"
        description="¿Estás seguro de que deseas eliminar este cupón? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteCoupon.isPending}
      />
    </div>
  );
}
