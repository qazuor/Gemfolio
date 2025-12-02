import {
  Badge,
  Button,
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
import { createFileRoute, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, ExternalLink, MoreHorizontal, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

import { DataTable, EmptyState, PageHeader } from '@/components/shared';
import {
  getStatusColor,
  getStatusLabel,
  type Page,
  useDeletePage,
  usePages,
} from '@/hooks/use-pages';

export const Route = createFileRoute('/_dashboard/paginas/')({
  component: PagesPage,
});

function PagesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page] = useState(1);

  const { data: pagesData, isLoading } = usePages({
    page,
    limit: 20,
    status: statusFilter !== 'all' ? (statusFilter as 'draft' | 'published') : undefined,
  });

  const deletePage = useDeletePage();

  const handleDelete = (pageItem: Page) => {
    if (confirm(`¿Estás seguro de eliminar la página "${pageItem.title}"?`)) {
      deletePage.mutate(pageItem.id);
    }
  };

  const columns: ColumnDef<Page>[] = [
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
        </div>
      ),
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
      accessorKey: 'updatedAt',
      header: 'Última modificación',
      cell: ({ row }) =>
        format(new Date(row.original.updatedAt), "dd MMM yyyy 'a las' HH:mm", { locale: es }),
    },
    {
      accessorKey: 'createdAt',
      header: 'Creada',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: es }),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const pageItem = row.original;
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
                <Link to="/paginas/$id" params={{ id: pageItem.id }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              {pageItem.status === 'published' && (
                <DropdownMenuItem asChild>
                  <a href={`/${pageItem.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver página
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(pageItem)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
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
        title="Páginas"
        description="Gestiona las páginas de contenido del sitio"
        actions={
          <Button asChild>
            <Link to="/paginas/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva página
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="published">Publicadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pagesData?.data.length === 0 && !isLoading ? (
        <EmptyState title="No hay páginas" description="Crea tu primera página de contenido">
          <Button asChild>
            <Link to="/paginas/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva página
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <DataTable columns={columns} data={pagesData?.data || []} isLoading={isLoading} />
      )}
    </div>
  );
}
