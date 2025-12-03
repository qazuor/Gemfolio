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
import { zodValidator } from '@tanstack/zod-adapter';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Copy, Edit, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog, DataTable, EmptyState, PageHeader } from '@/components/shared';
import { useCategories } from '@/hooks/use-categories';
import { useDeleteProduct, useProducts } from '@/hooks/use-products';
import { type ProductsSearch, productsSearchSchema } from '@/lib/search-schemas';

export const Route = createFileRoute('/_dashboard/productos/')({
  component: ProductsPage,
  validateSearch: zodValidator(productsSearchSchema),
});

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  stock: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  category?: { id: string; name: string } | null;
  images?: Array<{ url: string; isPrimary: boolean }>;
}

function ProductsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { search, status, categoryId, page } = Route.useSearch();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const updateSearch = (updates: Partial<ProductsSearch>) => {
    navigate({
      search: (prev: ProductsSearch) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const { data: productsData, isLoading } = useProducts({
    page: page ?? 1,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined,
  });

  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Producto',
      cell: ({ row }) => {
        const product = row.original;
        const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                  N/A
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ row }) => row.original.category?.name || '-',
    },
    {
      accessorKey: 'price',
      header: 'Precio',
      cell: ({ row }) => {
        const price = Number.parseFloat(row.original.price);
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }).format(price);
      },
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <span className={stock <= 0 ? 'text-destructive' : stock <= 5 ? 'text-warning' : ''}>
            {stock}
          </span>
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
        const product = row.original;
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
                <Link to="/productos/$id" params={{ id: product.id }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(product.id)}
              >
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
        title="Productos"
        description="Gestiona el catálogo de productos"
        actions={
          <Button asChild>
            <Link to="/productos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search ?? ''}
            onChange={(e) => updateSearch({ search: e.target.value || undefined })}
            className="pl-9"
          />
        </div>
        <Select
          value={status ?? ''}
          onValueChange={(value) =>
            updateSearch({
              status: value === 'all' ? undefined : (value as 'draft' | 'active' | 'archived'),
            })
          }
        >
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
        <Select
          value={categoryId ?? ''}
          onValueChange={(value) =>
            updateSearch({ categoryId: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {productsData?.data.length === 0 && !isLoading ? (
        <EmptyState
          title="No hay productos"
          description="Comienza agregando tu primer producto al catálogo"
          action={{
            label: 'Crear producto',
            onClick: () => {},
          }}
        />
      ) : (
        <DataTable columns={columns} data={productsData?.data || []} isLoading={isLoading} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
