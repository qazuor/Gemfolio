import { Check, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface AddToCartProps {
  productId: string;
  productName: string;
  price: number;
  maxQuantity?: number;
  disabled?: boolean;
}

export default function AddToCart({
  productId,
  productName,
  price,
  maxQuantity = 99,
  disabled = false,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;

    setIsAdding(true);

    // TODO: Integrate with cart store/API
    // For now, simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Store in localStorage for now
    const cartKey = 'gemfolio_cart';
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');

    const existingItemIndex = existingCart.findIndex(
      (item: { productId: string }) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push({
        productId,
        productName,
        price,
        quantity,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(existingCart));

    // Update cart count in header (dispatch custom event)
    window.dispatchEvent(new CustomEvent('cart-updated'));

    setIsAdding(false);
    setIsAdded(true);

    // Reset added state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Quantity Selector */}
      <div className="flex items-center rounded-lg border">
        <button
          type="button"
          onClick={decreaseQuantity}
          disabled={quantity <= 1 || disabled}
          className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          aria-label="Disminuir cantidad"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex h-12 w-16 items-center justify-center text-lg font-medium">
          {quantity}
        </span>
        <button
          type="button"
          onClick={increaseQuantity}
          disabled={quantity >= maxQuantity || disabled}
          className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          aria-label="Aumentar cantidad"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg px-6 text-lg font-medium transition-all ${
          disabled
            ? 'cursor-not-allowed bg-muted text-muted-foreground'
            : isAdded
              ? 'bg-green-600 text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isAdding ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isAdded ? (
          <>
            <Check className="h-5 w-5" />
            <span>¡Agregado!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            <span>{disabled ? 'Agotado' : 'Agregar al carrito'}</span>
          </>
        )}
      </button>
    </div>
  );
}
