import { useStore } from '@nanostores/react';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { $cartItemCount } from '@/stores/cart';
import { openCartDrawer } from '@/stores/ui';

export default function CartIcon() {
  const itemCount = useStore($cartItemCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={openCartDrawer}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Ver carrito"
    >
      <ShoppingBag className="h-4 w-4" />
      {mounted && itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
