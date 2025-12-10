import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Textarea,
} from '@gemfolio/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  CheckCircle,
  MessageSquare,
  ShoppingBag,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/shared';
import {
  getRatingLabel,
  getReviewStatusColor,
  getReviewStatusLabel,
  useAddAdminResponse,
  useDeleteReview,
  useModerateReview,
  useReview,
} from '@/hooks/use-reviews';

export const Route = createFileRoute('/_dashboard/resenas/$id')({
  component: ReviewDetailPage,
});

function ReviewDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: review, isLoading, error } = useReview(id);
  const moderateReview = useModerateReview();
  const deleteReview = useDeleteReview();
  const addAdminResponse = useAddAdminResponse();

  const [moderationNote, setModerationNote] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [showModerationForm, setShowModerationForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const handleModerate = (status: 'approved' | 'rejected') => {
    moderateReview.mutate(
      { id, status, note: moderationNote || undefined },
      {
        onSuccess: () => {
          setShowModerationForm(false);
          setModerationNote('');
        },
      }
    );
  };

  const handleAddResponse = () => {
    if (!adminResponse.trim()) return;
    addAdminResponse.mutate(
      { id, response: adminResponse },
      {
        onSuccess: () => {
          setShowResponseForm(false);
          setAdminResponse('');
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar esta reseña?')) {
      deleteReview.mutate(id, {
        onSuccess: () => navigate({ to: '/resenas' }),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró la reseña</p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/resenas">Volver a reseñas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/resenas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a reseñas
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Detalle de Reseña"
        description={`Reseña del ${format(new Date(review.createdAt), "d 'de' MMMM 'de' yyyy", {
          locale: es,
        })}`}
      >
        <Badge variant={getReviewStatusColor(review.status)}>
          {getReviewStatusLabel(review.status)}
        </Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Review Content */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={review.user.image ?? undefined} />
                    <AvatarFallback>
                      {review.user.name?.[0]?.toUpperCase() || review.user.email[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {review.user.name || 'Usuario sin nombre'}
                    </CardTitle>
                    <CardDescription>{review.user.email}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <Star
                        key={`star-${starNum}`}
                        className={`h-5 w-5 ${
                          starNum <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getRatingLabel(review.rating)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {review.title && <h3 className="font-semibold text-lg mb-2">{review.title}</h3>}
              <p className="text-muted-foreground whitespace-pre-wrap">{review.content}</p>

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                {review.isVerifiedPurchase && (
                  <Badge variant="secondary">
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    Compra verificada
                  </Badge>
                )}
                <span>
                  Publicado el{' '}
                  {format(new Date(review.createdAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                    locale: es,
                  })}
                </span>
              </div>

              {review.helpfulCount > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {review.helpfulCount} personas encontraron útil esta reseña
                </p>
              )}
            </CardContent>
          </Card>

          {/* Admin Response Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Respuesta del administrador
              </CardTitle>
            </CardHeader>
            <CardContent>
              {review.adminResponse ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{review.adminResponse}</p>
                  {review.adminResponseAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Respondido el{' '}
                      {format(new Date(review.adminResponseAt), "d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })}
                    </p>
                  )}
                </div>
              ) : showResponseForm ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Escribe una respuesta pública a esta reseña..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddResponse}
                      disabled={!adminResponse.trim() || addAdminResponse.isPending}
                    >
                      {addAdminResponse.isPending ? 'Guardando...' : 'Publicar respuesta'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowResponseForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    No hay respuesta del administrador todavía
                  </p>
                  <Button variant="outline" onClick={() => setShowResponseForm(true)}>
                    Agregar respuesta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moderation Section */}
          {review.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Moderar reseña</CardTitle>
                <CardDescription>
                  Aprueba o rechaza esta reseña para que sea visible en el sitio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showModerationForm ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Nota de moderación (opcional)..."
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleModerate('approved')}
                        disabled={moderateReview.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => handleModerate('rejected')}
                        disabled={moderateReview.isPending}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rechazar
                      </Button>
                      <Button variant="outline" onClick={() => setShowModerationForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowModerationForm(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button onClick={() => setShowModerationForm(true)} variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Moderation Info (if already moderated) */}
          {review.status !== 'pending' && review.moderatedAt && (
            <Card>
              <CardHeader>
                <CardTitle>Información de moderación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Estado:</span>{' '}
                    <Badge variant={getReviewStatusColor(review.status)}>
                      {getReviewStatusLabel(review.status)}
                    </Badge>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Moderado el:</span>{' '}
                    {format(new Date(review.moderatedAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                      locale: es,
                    })}
                  </p>
                  {review.moderationNote && (
                    <div>
                      <span className="text-muted-foreground">Nota:</span>
                      <p className="mt-1 bg-muted/50 rounded p-2">{review.moderationNote}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          {review.product && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {review.product.image && (
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{review.product.name}</p>
                    <Link
                      to="/productos/$id"
                      params={{ id: review.product.id }}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver producto
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleteReview.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteReview.isPending ? 'Eliminando...' : 'Eliminar reseña'}
              </Button>
            </CardContent>
          </Card>

          {/* Order Info */}
          {review.orderId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pedido asociado</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to="/pedidos/$id"
                  params={{ id: review.orderId }}
                  className="text-primary hover:underline"
                >
                  Ver pedido #{review.orderId.slice(0, 8)}...
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estadísticas de la reseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Útil:</span>
                <span>{review.helpfulCount} votos</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">No útil:</span>
                <span>{review.notHelpfulCount} votos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
