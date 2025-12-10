import { useStore } from '@nanostores/react';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { $wishlistCount } from '@/stores/wishlist';

interface WishlistIconProps {
  href?: string;
}

export default function WishlistIcon({ href = '/favoritos' }: WishlistIconProps) {
  const wishlistCount = useStore($wishlistCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <a
      href={href}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-red-500"
      aria-label="Ver favoritos"
      title="Mis favoritos"
    >
      <Heart className="h-4 w-4" />
      {mounted && wishlistCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {wishlistCount > 99 ? '99+' : wishlistCount}
        </span>
      )}
    </a>
  );
}
