import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  History,
  MoreHorizontal,
  Package,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';

import { AdjustStockModal, MovementHistoryModal } from '@/components/inventory';
import { DataTable, EmptyState, PageHeader } from '@/components/shared';
import { getStockStatus, type StockItem, useInventory, useLowStock } from '@/hooks/use-inventory';

export const Route = createFileRoute('/_dashboard/inventario/')({
  component: InventoryPage,
});

function InventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [page] = useState(1);

  const [adjustItem, setAdjustItem] = useState<StockItem | null>(null);
  const [historyItem, setHistoryItem] = useState<StockItem | null>(null);

  const {
    data: inventoryData,
    isLoading,
    isError,
  } = useInventory({
    page,
    limit: 50,
    search: search || undefined,
    lowStockOnly: filter === 'low',
  });

  const { data: lowStockData } = useLowStock();

  // Handle error state
  if (isError) {
    return (
      <div>
        <PageHeader title="Inventario" description="Gestiona el stock de productos" />
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Error al cargar inventario</h2>
          <p className="text-muted-foreground">No se pudo cargar la informacion del inventario</p>
        </div>
      </div>
    );
  }

  const items = inventoryData?.data ?? [];
  const lowStockCount = lowStockData?.data?.count ?? 0;
  const outOfStockCount = items.filter((item) => item.currentStock <= 0).length;

  const filteredData = items.filter((item) => {
    if (filter === 'out') return item.currentStock <= 0;
    if (filter === 'low') return item.isLowStock && item.currentStock > 0;
    return true;
  });

  const columns: ColumnDef<StockItem>[] = [
    {
      accessorKey: 'productName',
      header: 'Producto',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <p className="font-medium">{item.productName}</p>
            {item.variantName && (
              <p className="text-xs text-muted-foreground">{item.variantName}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => row.original.sku || '-',
    },
    {
      accessorKey: 'currentStock',
      header: 'Stock actual',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span
            className={`font-medium ${
              item.currentStock <= 0 ? 'text-destructive' : item.isLowStock ? 'text-yellow-600' : ''
            }`}
          >
            {item.currentStock}
          </span>
        );
      },
    },
    {
      accessorKey: 'lowStockThreshold',
      header: 'Umbral',
      cell: ({ row }) => row.original.lowStockThreshold ?? 5,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        return <Badge variant={status.color}>{status.label}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setAdjustItem(item)}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Ajustar stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHistoryItem(item)}>
                <History className="mr-2 h-4 w-4" />
                Ver historial
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Inventario" description="Gestiona el stock de productos" />

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData?.pagination?.total ?? 0}</div>
          </CardContent>
        </Card>

        <Card className={lowStockCount > 0 ? 'border-yellow-200 bg-yellow-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock bajo</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${lowStockCount > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-yellow-600' : ''}`}>
              {lowStockCount}
            </div>
          </CardContent>
        </Card>

        <Card className={outOfStockCount > 0 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agotados</CardTitle>
            <Package
              className={`h-4 w-4 ${outOfStockCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-destructive' : ''}`}>
              {outOfStockCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(inventoryData?.pagination?.total ?? 0) - outOfStockCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="out">Agotados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredData.length === 0 && !isLoading ? (
        <EmptyState
          title="No hay productos"
          description={
            filter !== 'all'
              ? 'No hay productos que coincidan con el filtro seleccionado'
              : 'No hay productos en el inventario'
          }
        />
      ) : (
        <DataTable columns={columns} data={filteredData} isLoading={isLoading} />
      )}

      {/* Modals */}
      <AdjustStockModal
        item={adjustItem}
        open={!!adjustItem}
        onOpenChange={(open) => !open && setAdjustItem(null)}
      />

      <MovementHistoryModal
        item={historyItem}
        open={!!historyItem}
        onOpenChange={(open) => !open && setHistoryItem(null)}
      />
    </div>
  );
}
