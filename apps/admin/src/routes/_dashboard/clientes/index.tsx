import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
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
import { createFileRoute, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, MoreHorizontal, Search } from 'lucide-react';
import { useState } from 'react';

import { DataTable, EmptyState, PageHeader } from '@/components/shared';
import { type Customer, getRoleColor, getRoleLabel, useCustomers } from '@/hooks/use-customers';

export const Route = createFileRoute('/_dashboard/clientes/')({
  component: CustomersPage,
});

function CustomersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page] = useState(1);

  const { data: customersData, isLoading } = useCustomers({
    page,
    limit: 20,
    search: search || undefined,
    role: roleFilter !== 'all' ? (roleFilter as 'customer' | 'admin' | 'super_admin') : undefined,
  });

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

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Cliente',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={customer.image || undefined}
                alt={customer.name || customer.email}
              />
              <AvatarFallback>{getInitials(customer.name, customer.email)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{customer.name || 'Sin nombre'}</p>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const role = row.original.role;
        return <Badge variant={getRoleColor(role)}>{getRoleLabel(role)}</Badge>;
      },
    },
    {
      accessorKey: 'emailVerified',
      header: 'Email verificado',
      cell: ({ row }) => (
        <Badge variant={row.original.emailVerified ? 'default' : 'secondary'}>
          {row.original.emailVerified ? 'Verificado' : 'Pendiente'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Registro',
      cell: ({ row }) =>
        formatDistanceToNow(new Date(row.original.createdAt), {
          addSuffix: true,
          locale: es,
        }),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const customer = row.original;
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
                <Link to="/clientes/$id" params={{ id: customer.id }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Clientes" description="Gestiona los clientes de la tienda" />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="customer">Clientes</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
            <SelectItem value="super_admin">Super Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {customersData?.data.length === 0 && !isLoading ? (
        <EmptyState
          title="No hay clientes"
          description="Los clientes aparecerán aquí cuando se registren"
        />
      ) : (
        <DataTable columns={columns} data={customersData?.data || []} isLoading={isLoading} />
      )}
    </div>
  );
}
