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
} from '@gemfolio/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, MoreHorizontal, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog, DataTable, EmptyState, PageHeader, Pagination } from '@/components/shared';
import { useBundles, useDeleteBundle } from '@/hooks/use-bundles';

export const Route = createFileRoute('/_dashboard/bundles/')({
  component: BundlesPage,
});

interface BundleItem {
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: string;
    images?: Array<{ url: string; isPrimary: boolean }>;
  };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: string;
  comparePrice: string | null;
  status: 'draft' | 'active' | 'archived';
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  items: BundleItem[];
}

function BundlesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: bundlesData, isLoading } = useBundles({
    page,
    limit: 10,
    search: search || undefined,
    status: status as 'draft' | 'active' | 'archived' | undefined,
  });

  const deleteBundle = useDeleteBundle();

  const handleDelete = () => {
    if (deleteId) {
      deleteBundle.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const columns: ColumnDef<Bundle>[] = [
    {
      accessorKey: 'name',
      header: 'Bundle',
      cell: ({ row }) => {
        const bundle = row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden">
              {bundle.image ? (
                <img src={bundle.image} alt={bundle.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <Package className="h-4 w-4" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{bundle.name}</p>
              <p className="text-xs text-muted-foreground">{bundle.items.length} productos</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Precio',
      cell: ({ row }) => {
        const bundle = row.original;
        const price = Number.parseFloat(bundle.price);
        const comparePrice = bundle.comparePrice ? Number.parseFloat(bundle.comparePrice) : null;

        return (
          <div>
            <p className="font-medium">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
              }).format(price)}
            </p>
            {comparePrice && (
              <p className="text-xs text-muted-foreground line-through">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(comparePrice)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
          active: 'default',
          draft: 'secondary',
          archived: 'outline',
        };
        const labels: Record<string, string> = {
          active: 'Activo',
          draft: 'Borrador',
          archived: 'Archivado',
        };
        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
      },
    },
    {
      accessorKey: 'validFrom',
      header: 'Vigencia',
      cell: ({ row }) => {
        const bundle = row.original;
        if (!bundle.validFrom && !bundle.validUntil) {
          return <span className="text-muted-foreground">Sin límite</span>;
        }
        return (
          <div className="text-sm">
            {bundle.validFrom && (
              <p>
                Desde:{' '}
                {new Date(bundle.validFrom).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })}
              </p>
            )}
            {bundle.validUntil && (
              <p>
                Hasta:{' '}
                {new Date(bundle.validUntil).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Creado',
      cell: ({ row }) =>
        formatDistanceToNow(new Date(row.original.createdAt), {
          addSuffix: true,
          locale: es,
        }),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const bundle = row.original;
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
                <Link to="/bundles/$id" params={{ id: bundle.id }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(bundle.id)}>
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
        title="Bundles"
        description="Crea paquetes de productos con precios especiales"
        actions={
          <Button asChild>
            <Link to="/bundles/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo bundle
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar bundles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
            <SelectItem value="archived">Archivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {bundlesData?.data.length === 0 && !isLoading ? (
        <EmptyState
          title="No hay bundles"
          description="Crea tu primer bundle para ofrecer paquetes de productos"
          action={{
            label: 'Crear bundle',
            onClick: () => navigate({ to: '/bundles/nuevo' }),
          }}
        />
      ) : (
        <>
          <DataTable columns={columns} data={bundlesData?.data || []} isLoading={isLoading} />
          {bundlesData?.pagination && bundlesData.pagination.totalPages > 1 && (
            <Pagination
              page={bundlesData.pagination.page}
              totalPages={bundlesData.pagination.totalPages}
              total={bundlesData.pagination.total}
              limit={bundlesData.pagination.limit}
              onPageChange={(newPage) => setPage(newPage)}
              showPageSizeSelector={false}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar bundle"
        description="¿Estás seguro de que deseas eliminar este bundle? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteBundle.isPending}
      />
    </div>
  );
}
