import { useStore } from '@nanostores/react';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { $wishlist, toggleWishlistLocal, type WishlistProduct } from '@/stores/wishlist';

interface WishlistButtonProps {
  product: WishlistProduct;
  variant?: 'icon' | 'button' | 'icon-sm';
  className?: string;
}

export default function WishlistButton({
  product,
  variant = 'icon',
  className = '',
}: WishlistButtonProps) {
  const wishlist = useStore($wishlist);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsInWishlist(wishlist.some((p) => p.id === product.id));
  }, [wishlist, product.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    const added = toggleWishlistLocal(product);
    setIsInWishlist(added);

    // Dispatch event for analytics or other components
    window.dispatchEvent(
      new CustomEvent('wishlist-updated', {
        detail: { productId: product.id, added },
      })
    );

    setTimeout(() => setIsAnimating(false), 300);
  };

  if (variant === 'icon-sm') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`group flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110 ${className}`}
        aria-label={isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        title={isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart
          className={`h-4 w-4 transition-all ${isAnimating ? 'scale-125' : ''} ${
            isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600 group-hover:text-red-500'
          }`}
        />
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`group flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-all hover:border-red-500 hover:scale-105 ${
          isInWishlist ? 'border-red-500' : 'border-border'
        } ${className}`}
        aria-label={isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        title={isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart
          className={`h-5 w-5 transition-all ${isAnimating ? 'scale-125' : ''} ${
            isInWishlist
              ? 'fill-red-500 text-red-500'
              : 'text-muted-foreground group-hover:text-red-500'
          }`}
        />
      </button>
    );
  }

  // variant === 'button'
  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`group flex h-12 items-center justify-center gap-2 rounded-lg border px-4 transition-all hover:border-red-500 ${
        isInWishlist ? 'border-red-500 bg-red-50' : 'border-border bg-background'
      } ${className}`}
      aria-label={isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart
        className={`h-5 w-5 transition-all ${isAnimating ? 'scale-125' : ''} ${
          isInWishlist
            ? 'fill-red-500 text-red-500'
            : 'text-muted-foreground group-hover:text-red-500'
        }`}
      />
      <span
        className={`font-medium ${
          isInWishlist ? 'text-red-600' : 'text-muted-foreground group-hover:text-red-500'
        }`}
      >
        {isInWishlist ? 'En favoritos' : 'Agregar a favoritos'}
      </span>
    </button>
  );
}
