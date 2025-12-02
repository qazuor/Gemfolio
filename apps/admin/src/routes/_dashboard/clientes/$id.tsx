import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
} from '@gemfolio/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Calendar, DollarSign, Mail, Package, ShoppingCart, User } from 'lucide-react';

import { PageHeader } from '@/components/shared';
import {
  formatCurrency,
  getRoleColor,
  getRoleLabel,
  useCustomer,
  useCustomerOrders,
  useUpdateCustomerRole,
} from '@/hooks/use-customers';
import {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getStatusColor,
  getStatusLabel,
} from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/clientes/$id')({
  component: CustomerDetailPage,
});

type UserRole = 'customer' | 'admin' | 'super_admin';

function CustomerDetailPage() {
  const { id } = Route.useParams();
  const { data: customer, isLoading } = useCustomer(id);
  const { data: ordersData, isLoading: isLoadingOrders } = useCustomerOrders(id);
  const updateRole = useUpdateCustomerRole();

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleRoleChange = (newRole: string) => {
    if (customer) {
      updateRole.mutate({ id: customer.id, role: newRole as UserRole });
    }
  };

  if (isLoading) {
    return <CustomerDetailSkeleton />;
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Cliente no encontrado</h2>
        <p className="text-muted-foreground">El cliente que buscas no existe</p>
        <Button asChild className="mt-4">
          <Link to="/clientes">Volver a clientes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={customer.name || 'Sin nombre'} description={customer.email} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pedidos realizados</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customer.orderCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total gastado</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Historial de pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : ordersData?.data.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    Este cliente aún no ha realizado pedidos
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersData?.data.map((order) => (
                    <Link
                      key={order.id}
                      to="/pedidos/$id"
                      params={{ id: order.id }}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusColor(order.status as any)}>
                          {getStatusLabel(order.status as any)}
                        </Badge>
                        <Badge variant={getPaymentStatusColor(order.paymentStatus as any)}>
                          {getPaymentStatusLabel(order.paymentStatus as any)}
                        </Badge>
                        <span className="font-medium">{formatCurrency(order.total)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={customer.image || undefined}
                    alt={customer.name || customer.email}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(customer.name, customer.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{customer.name || 'Sin nombre'}</p>
                  <Badge variant={customer.emailVerified ? 'default' : 'secondary'}>
                    {customer.emailVerified ? 'Email verificado' : 'Email pendiente'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Registrado el{' '}
                    {format(new Date(customer.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Card */}
          <Card>
            <CardHeader>
              <CardTitle>Rol y permisos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Rol actual</p>
                  <Badge variant={getRoleColor(customer.role)} className="mt-1">
                    {getRoleLabel(customer.role)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Cambiar rol</p>
                <Select
                  value={customer.role}
                  onValueChange={handleRoleChange}
                  disabled={updateRole.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Cliente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Cambiar el rol afecta los permisos del usuario en el sistema
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-[300px]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    </div>
  );
}
