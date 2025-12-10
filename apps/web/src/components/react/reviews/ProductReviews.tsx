import { ChevronDown, ChevronUp, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import StarRating from './StarRating';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
  adminResponse?: {
    content: string;
    createdAt: string;
  };
}

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
}

export default function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState<RatingDistribution[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>(
    'recent'
  );
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: '10',
        sortBy,
        status: 'approved',
      });

      const response = await fetch(`/api/reviews?${params}`);
      if (!response.ok) throw new Error('Error al cargar las reseñas');

      const data = await response.json();

      if (page === 1) {
        setReviews(data.reviews || []);
      } else {
        setReviews((prev) => [...prev, ...(data.reviews || [])]);
      }

      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
      setDistribution(data.distribution || []);
      setHasMore(data.hasMore || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [productId, page, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r))
        );
      }
    } catch {
      // Silently fail
    }
  };

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg md:col-span-2" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => fetchReviews()}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reseñas de clientes
        </h2>
        <a
          href={`/producto/${productSlug}/resena`}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Escribir reseña
        </a>
      </div>

      {totalReviews === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Sé el primero en dejar una reseña</h3>
          <p className="mt-2 text-muted-foreground">
            Comparte tu experiencia con este producto y ayuda a otros compradores
          </p>
          <a
            href={`/producto/${productSlug}/resena`}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Escribir reseña
          </a>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Average Rating */}
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="mt-2 flex justify-center">
                <StarRating rating={averageRating} size="lg" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Basado en {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
              </p>
            </div>

            {/* Distribution */}
            <div className="rounded-lg border bg-card p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Distribución de calificaciones</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const dist = distribution.find((d) => d.rating === rating);
                  const percentage = dist?.percentage || 0;
                  const count = dist?.count || 0;

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="w-8 text-sm text-muted-foreground">{rating} ★</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-sm text-muted-foreground text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-sm text-muted-foreground">
              {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as typeof sortBy);
                setPage(1);
              }}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="recent">Más recientes</option>
              <option value="helpful">Más útiles</option>
              <option value="rating_high">Mayor calificación</option>
              <option value="rating_low">Menor calificación</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => {
              const isExpanded = expandedReviews.has(review.id);
              const isLongContent = review.content.length > 300;

              return (
                <div key={review.id} className="rounded-lg border bg-card p-4 md:p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {review.userAvatar ? (
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.userName}</span>
                          {review.verified && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Compra verificada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>

                  {/* Review Content */}
                  <div className="mt-4">
                    {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
                    <p
                      className={`text-muted-foreground ${!isExpanded && isLongContent ? 'line-clamp-3' : ''}`}
                    >
                      {review.content}
                    </p>
                    {isLongContent && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(review.id)}
                        className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Ver menos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Ver más
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Admin Response */}
                  {review.adminResponse && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">Respuesta de Gemfolio</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.adminResponse.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.adminResponse.content}
                      </p>
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="mt-4 flex items-center gap-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Útil ({review.helpful})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Cargar más reseñas'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
