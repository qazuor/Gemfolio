import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { zodValidator } from '@tanstack/zod-adapter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';

import { DataTable, EmptyState, PageHeader, Pagination } from '@/components/shared';
import {
  getReviewStatusColor,
  getReviewStatusLabel,
  type Review,
  useDeleteReview,
  useModerateReview,
  useReviewStats,
  useReviews,
} from '@/hooks/use-reviews';
import { type ReviewsSearch, reviewsSearchSchema } from '@/lib/search-schemas';

export const Route = createFileRoute('/_dashboard/resenas/')({
  component: ReviewsPage,
  validateSearch: zodValidator(reviewsSearchSchema),
});

function ReviewsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { status, page, minRating, isVerifiedPurchase } = Route.useSearch();

  const updateSearch = (updates: Partial<ReviewsSearch>) => {
    navigate({
      search: (prev: ReviewsSearch) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const { data: reviewsData, isLoading } = useReviews({
    page: page ?? 1,
    limit: 20,
    status: status || undefined,
    minRating: minRating || undefined,
    isVerifiedPurchase: isVerifiedPurchase,
  });

  const { data: statsData } = useReviewStats();
  const moderateReview = useModerateReview();
  const deleteReview = useDeleteReview();

  const handleModerate = (id: string, newStatus: 'approved' | 'rejected') => {
    moderateReview.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta reseña?')) {
      deleteReview.mutate(id);
    }
  };

  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: 'user',
      header: 'Usuario',
      cell: ({ row }) => {
        const review = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.user.image ?? undefined} />
              <AvatarFallback>
                {review.user.name?.[0]?.toUpperCase() || review.user.email[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{review.user.name || 'Sin nombre'}</p>
              <p className="text-xs text-muted-foreground">{review.user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'product',
      header: 'Producto',
      cell: ({ row }) => {
        const review = row.original;
        return review.product ? (
          <div className="max-w-[200px]">
            <p className="font-medium truncate">{review.product.name}</p>
            <Link
              to="/productos/$id"
              params={{ id: review.product.id }}
              className="text-xs text-primary hover:underline"
            >
              Ver producto
            </Link>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: 'Calificación',
      cell: ({ row }) => {
        const rating = row.original.rating;
        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starNum) => (
              <Star
                key={`star-${starNum}`}
                className={`h-4 w-4 ${
                  starNum <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'content',
      header: 'Comentario',
      cell: ({ row }) => {
        const review = row.original;
        return (
          <div className="max-w-[250px]">
            {review.title && <p className="font-medium truncate">{review.title}</p>}
            <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'isVerifiedPurchase',
      header: 'Verificada',
      cell: ({ row }) => {
        const isVerified = row.original.isVerifiedPurchase;
        return isVerified ? (
          <Badge variant="secondary">Compra verificada</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">No verificada</span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const reviewStatus = row.original.status;
        return (
          <Badge variant={getReviewStatusColor(reviewStatus)}>
            {getReviewStatusLabel(reviewStatus)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return (
          <p className="text-sm text-muted-foreground">
            {format(new Date(date), 'dd MMM yyyy', { locale: es })}
          </p>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const review = row.original;
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
                <Link to="/resenas/$id" params={{ id: review.id }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              {review.status === 'pending' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleModerate(review.id, 'approved')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Aprobar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleModerate(review.id, 'rejected')}>
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                    Rechazar
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(review.id)}
                className="text-destructive"
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
      <PageHeader title="Reseñas" description="Modera las reseñas de productos">
        {statsData && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>{statsData.totalReviews} total</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{statsData.pendingReviews} pendientes</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{statsData.averageRating} promedio</span>
            </div>
          </div>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <Select
          value={status ?? ''}
          onValueChange={(value) =>
            updateSearch({ status: value === 'all' ? undefined : (value as Review['status']) })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="approved">Aprobada</SelectItem>
            <SelectItem value="rejected">Rechazada</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={minRating?.toString() ?? ''}
          onValueChange={(value) =>
            updateSearch({
              minRating: value === 'all' ? undefined : Number.parseInt(value, 10),
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Calificación mínima" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las calificaciones</SelectItem>
            <SelectItem value="5">5 estrellas</SelectItem>
            <SelectItem value="4">4+ estrellas</SelectItem>
            <SelectItem value="3">3+ estrellas</SelectItem>
            <SelectItem value="2">2+ estrellas</SelectItem>
            <SelectItem value="1">1+ estrellas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={isVerifiedPurchase === undefined ? '' : isVerifiedPurchase.toString()}
          onValueChange={(value) =>
            updateSearch({
              isVerifiedPurchase: value === 'all' ? undefined : value === 'true',
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de compra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="true">Compra verificada</SelectItem>
            <SelectItem value="false">No verificada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reviewsData?.data.length === 0 && !isLoading ? (
        <EmptyState
          title="No hay reseñas"
          description="Las reseñas aparecerán aquí cuando los clientes las escriban"
        />
      ) : (
        <>
          <DataTable columns={columns} data={reviewsData?.data || []} isLoading={isLoading} />
          {reviewsData?.meta && reviewsData.meta.totalPages > 1 && (
            <Pagination
              page={reviewsData.meta.page}
              totalPages={reviewsData.meta.totalPages}
              total={reviewsData.meta.total}
              limit={reviewsData.meta.limit}
              onPageChange={(newPage) => updateSearch({ page: newPage })}
              showPageSizeSelector={false}
            />
          )}
        </>
      )}
    </div>
  );
}
