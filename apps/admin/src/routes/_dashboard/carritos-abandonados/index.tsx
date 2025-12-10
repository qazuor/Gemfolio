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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gemfolio/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { zodValidator } from '@tanstack/zod-adapter';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle,
  DollarSign,
  Eye,
  Mail,
  MoreHorizontal,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from 'lucide-react';

import { DataTable, EmptyState, PageHeader, Pagination } from '@/components/shared';
import {
  type AbandonedCart,
  type AbandonedCartStatus,
  getStatusColor,
  getStatusLabel,
  useAbandonedCartStats,
  useAbandonedCarts,
  useDeleteAbandonedCart,
  useSendRecoveryEmail,
} from '@/hooks/use-abandoned-carts';
import { type AbandonedCartsSearch, abandonedCartsSearchSchema } from '@/lib/search-schemas';

export const Route = createFileRoute('/_dashboard/carritos-abandonados/')({
  component: AbandonedCartsPage,
  validateSearch: zodValidator(abandonedCartsSearchSchema),
});

function AbandonedCartsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { status, isRecovered, hasEmail, page } = Route.useSearch();

  const updateSearch = (updates: Partial<AbandonedCartsSearch>) => {
    navigate({
      search: (prev: AbandonedCartsSearch) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const { data: cartsData, isLoading } = useAbandonedCarts({
    page: page ?? 1,
    limit: 20,
    status: status || undefined,
    isRecovered: isRecovered,
    hasEmail: hasEmail,
  });

  const { data: statsData } = useAbandonedCartStats();
  const sendRecovery = useSendRecoveryEmail();
  const deleteCart = useDeleteAbandonedCart();

  const handleSendRecovery = (id: string) => {
    sendRecovery.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      deleteCart.mutate(id);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(value));
  };

  const columns: ColumnDef<AbandonedCart>[] = [
    {
      accessorKey: 'customer',
      header: 'Cliente',
      cell: ({ row }) => {
        const cart = row.original;
        const email = cart.user?.email || cart.customerEmail;
        const name = cart.user?.name;
        return (
          <div>
            {name && <p className="font-medium">{name}</p>}
            {email ? (
              <p className="text-sm text-muted-foreground">{email}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sin email</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'cartTotal',
      header: 'Total',
      cell: ({ row }) => {
        const total = row.original.cartTotal;
        return <p className="font-medium">{formatCurrency(total)}</p>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const cartStatus = row.original.status;
        return <Badge variant={getStatusColor(cartStatus)}>{getStatusLabel(cartStatus)}</Badge>;
      },
    },
    {
      accessorKey: 'isRecovered',
      header: 'Recuperado',
      cell: ({ row }) => {
        const recovered = row.original.isRecovered;
        return recovered ? (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Sí
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">No</span>
        );
      },
    },
    {
      accessorKey: 'recoveryAttempts',
      header: 'Intentos',
      cell: ({ row }) => {
        const attempts = row.original.recoveryAttempts;
        return (
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{attempts}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'abandonedAt',
      header: 'Abandonado',
      cell: ({ row }) => {
        const date = row.original.abandonedAt;
        return (
          <div>
            <p className="text-sm">
              {formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(date), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const cart = row.original;
        const canSendEmail =
          (cart.user?.email || cart.customerEmail) &&
          !cart.isRecovered &&
          cart.status !== 'expired' &&
          cart.status !== 'unsubscribed';

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
                <Link to="/carritos-abandonados/$id" params={{ id: cart.id }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              {canSendEmail && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSendRecovery(cart.id)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar email de recuperación
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(cart.id)} className="text-destructive">
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
        title="Carritos Abandonados"
        description="Gestiona los carritos abandonados y envía emails de recuperación"
      />

      {/* Stats Cards */}
      {statsData && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total abandonados
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalAbandoned}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.pendingRecovery} pendientes de recuperar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recuperados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalRecovered}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.recoveryRate.toFixed(1)}% tasa de recuperación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos recuperados
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(String(statsData.totalRecoveredRevenue))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos perdidos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(String(statsData.totalLostRevenue))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <Select
          value={status ?? ''}
          onValueChange={(value) =>
            updateSearch({ status: value === 'all' ? undefined : (value as AbandonedCartStatus) })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="email_sent">Email enviado</SelectItem>
            <SelectItem value="follow_up_sent">Seguimiento enviado</SelectItem>
            <SelectItem value="recovered">Recuperado</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="unsubscribed">Dado de baja</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={isRecovered === undefined ? '' : isRecovered.toString()}
          onValueChange={(value) =>
            updateSearch({
              isRecovered: value === 'all' ? undefined : value === 'true',
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Recuperación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Recuperados</SelectItem>
            <SelectItem value="false">No recuperados</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={hasEmail === undefined ? '' : hasEmail.toString()}
          onValueChange={(value) =>
            updateSearch({
              hasEmail: value === 'all' ? undefined : value === 'true',
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Con email" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Con email</SelectItem>
            <SelectItem value="false">Sin email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {cartsData?.data.length === 0 && !isLoading ? (
        <EmptyState
          title="No hay carritos abandonados"
          description="Los carritos abandonados aparecerán aquí automáticamente"
        />
      ) : (
        <>
          <DataTable columns={columns} data={cartsData?.data || []} isLoading={isLoading} />
          {cartsData?.pagination && cartsData.pagination.totalPages > 1 && (
            <Pagination
              page={cartsData.pagination.page}
              totalPages={cartsData.pagination.totalPages}
              total={cartsData.pagination.total}
              limit={cartsData.pagination.limit}
              onPageChange={(newPage) => updateSearch({ page: newPage })}
              showPageSizeSelector={false}
            />
          )}
        </>
      )}
    </div>
  );
}
