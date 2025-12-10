import { useStore } from '@nanostores/react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { addToCart } from '@/stores/cart';
import { openCartDrawer } from '@/stores/ui';
import {
  $wishlist,
  clearWishlistLocal,
  getAvailableWishlistProducts,
  getOutOfStockWishlistProducts,
  removeFromWishlistLocal,
} from '@/stores/wishlist';

export default function WishlistPage() {
  const wishlist = useStore($wishlist);
  const availableProducts = getAvailableWishlistProducts();
  const outOfStockProducts = getOutOfStockWishlistProducts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

  const handleRemove = (productId: string) => {
    removeFromWishlistLocal(productId);
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de eliminar todos los productos de tus favoritos?')) {
      clearWishlistLocal();
    }
  };

  const handleAddToCart = (product: (typeof wishlist)[0]) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      maxQuantity: product.stock,
    });
    openCartDrawer();
  };

  const handleAddAllToCart = () => {
    for (const product of availableProducts) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        maxQuantity: product.stock,
      });
    }
    openCartDrawer();
  };

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Tu lista de favoritos está vacía</h2>
        <p className="text-muted-foreground mb-6">
          Explora nuestros productos y agrega tus favoritos para comprarlos más tarde
        </p>
        <a
          href="/catalogo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Explorar productos
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? 'producto' : 'productos'} en tu lista
        </p>
        <div className="flex gap-2">
          {availableProducts.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Agregar todos al carrito
            </button>
          )}
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar lista
          </button>
        </div>
      </div>

      {/* Available Products */}
      {availableProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Productos disponibles</h2>
          <div className="grid gap-4">
            {availableProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-lg border p-4 bg-card"
              >
                {/* Image */}
                <a href={`/producto/${product.slug}`} className="shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </a>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <a
                    href={`/producto/${product.slug}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {product.name}
                  </a>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.comparePrice)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-green-600">{product.stock} en stock</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                    aria-label="Eliminar de favoritos"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Out of Stock Products */}
      {outOfStockProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
            Productos no disponibles
          </h2>
          <div className="grid gap-4">
            {outOfStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-lg border p-4 bg-muted/30 opacity-75"
              >
                {/* Image */}
                <a href={`/producto/${product.slug}`} className="shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-24 rounded-lg object-cover grayscale"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </a>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <a
                    href={`/producto/${product.slug}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {product.name}
                  </a>
                  <div className="mt-1">
                    <span className="text-lg font-bold text-muted-foreground">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-red-600">
                    {product.status !== 'active' ? 'Producto no disponible' : 'Sin stock'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">No disponible</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                    aria-label="Eliminar de favoritos"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
