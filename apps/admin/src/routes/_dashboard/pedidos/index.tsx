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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, MoreHorizontal, Search } from 'lucide-react';

import { DataTable, EmptyState, PageHeader } from '@/components/shared';
import {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getStatusColor,
  getStatusLabel,
  type Order,
  useOrders,
} from '@/hooks/use-orders';
import { type OrdersSearch, ordersSearchSchema } from '@/lib/search-schemas';

export const Route = createFileRoute('/_dashboard/pedidos/')({
  component: OrdersPage,
  validateSearch: zodValidator(ordersSearchSchema),
});

function OrdersPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { search, status, paymentStatus, page } = Route.useSearch();

  const updateSearch = (updates: Partial<OrdersSearch>) => {
    navigate({
      search: (prev: OrdersSearch) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const { data: ordersData, isLoading } = useOrders({
    page: page ?? 1,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
  });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(value));
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Pedido',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <p className="font-medium">#{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'customerName',
      header: 'Cliente',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <p className="font-medium">{formatCurrency(order.total)}</p>
            {order.items && (
              <p className="text-xs text-muted-foreground">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
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
        return <Badge variant={getStatusColor(status)}>{getStatusLabel(status)}</Badge>;
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Pago',
      cell: ({ row }) => {
        const paymentStatus = row.original.paymentStatus;
        return (
          <Badge variant={getPaymentStatusColor(paymentStatus)}>
            {getPaymentStatusLabel(paymentStatus)}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
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
                <Link to="/pedidos/$id" params={{ id: order.id }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(order.orderNumber);
                }}
              >
                Copiar número de pedido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Pedidos" description="Gestiona los pedidos de la tienda" />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, email o nombre..."
            value={search ?? ''}
            onChange={(e) => updateSearch({ search: e.target.value || undefined })}
            className="pl-9"
          />
        </div>
        <Select
          value={status ?? ''}
          onValueChange={(value) =>
            updateSearch({ status: value === 'all' ? undefined : (value as Order['status']) })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="processing">En preparación</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={paymentStatus ?? ''}
          onValueChange={(value) =>
            updateSearch({
              paymentStatus: value === 'all' ? undefined : (value as Order['paymentStatus']),
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="failed">Fallido</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {ordersData?.data.length === 0 && !isLoading ? (
        <EmptyState
          title="No hay pedidos"
          description="Los pedidos aparecerán aquí cuando los clientes realicen compras"
        />
      ) : (
        <DataTable columns={columns} data={ordersData?.data || []} isLoading={isLoading} />
      )}
    </div>
  );
}
