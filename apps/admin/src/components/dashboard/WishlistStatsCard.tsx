import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { Link } from '@tanstack/react-router';
import { Heart, Users } from 'lucide-react';

import { useWishlistStats } from '@/hooks/use-wishlist-stats';

export function WishlistStatsCard() {
  const { data: stats, isLoading } = useWishlistStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number.parseFloat(value));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <CardTitle className="text-lg">Productos más deseados</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="mb-4 grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-3">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalWishlisted}</p>
            <p className="text-xs text-muted-foreground">Total en wishlists</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
            <p className="text-xs text-muted-foreground">Usuarios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.uniqueProducts}</p>
            <p className="text-xs text-muted-foreground">Productos</p>
          </div>
        </div>

        {/* Top Products */}
        {stats.mostWishlisted.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <Heart className="mx-auto mb-2 h-8 w-8" />
            <p>No hay productos en wishlists todavía</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Top 5 productos</p>
            {stats.mostWishlisted.slice(0, 5).map((product, index) => (
              <Link
                key={product.productId}
                to="/productos/$id"
                params={{ id: product.productId }}
                className="flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {index + 1}
                </div>
                {product.productImage ? (
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    <Heart className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(product.productPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{product.count}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
