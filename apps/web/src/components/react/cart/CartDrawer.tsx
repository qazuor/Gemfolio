import { useStore } from '@nanostores/react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import {
  $cart,
  $cartDiscount,
  $cartItemCount,
  $cartSubtotal,
  $cartTotal,
  removeCartItem,
  updateCartItemQuantity,
} from '@/stores/cart';
import { $isCartDrawerOpen, closeCartDrawer } from '@/stores/ui';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CartDrawer() {
  const isOpen = useStore($isCartDrawerOpen);
  const cart = useStore($cart);
  const itemCount = useStore($cartItemCount);
  const subtotal = useStore($cartSubtotal);
  const discount = useStore($cartDiscount);
  const total = useStore($cartTotal);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCartDrawer();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={closeCartDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <ShoppingBag className="h-5 w-5" />
            Tu carrito
            {itemCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-sm text-primary-foreground">
                {itemCount}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCartDrawer}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="mb-1 font-medium">Tu carrito está vacío</h3>
              <p className="text-sm text-muted-foreground">
                Agrega productos para comenzar tu compra
              </p>
            </div>
            <a
              href="/catalogo"
              onClick={closeCartDrawer}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ver catálogo
            </a>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-4 rounded-lg border p-3">
                    {/* Image */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="line-clamp-1 font-medium">{item.name}</h4>
                          {item.variantName && (
                            <p className="text-sm text-muted-foreground">{item.variantName}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Eliminar ${item.name} del carrito`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 rounded-lg border">
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-medium text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              {/* Summary */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento ({cart.couponCode})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid gap-2">
                <a
                  href="/checkout"
                  onClick={closeCartDrawer}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Finalizar compra
                </a>
                <a
                  href="/carrito"
                  onClick={closeCartDrawer}
                  className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-6 font-medium transition-colors hover:bg-accent"
                >
                  Ver carrito completo
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
