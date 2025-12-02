import { useStore } from '@nanostores/react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
  $cart,
  $cartDiscount,
  $cartItemCount,
  $cartSubtotal,
  $cartTotal,
  applyCoupon,
  clearCart,
  removeCartItem,
  removeCoupon,
  updateCartItemQuantity,
} from '@/stores/cart';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CartPage() {
  const cart = useStore($cart);
  const itemCount = useStore($cartItemCount);
  const subtotal = useStore($cartSubtotal);
  const discount = useStore($cartDiscount);
  const total = useStore($cartTotal);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Cupón inválido');
      }

      const data = await response.json();
      applyCoupon(couponCode, data.discount);
      setCouponCode('');
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Error al aplicar cupón');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponError('');
  };

  if (cart.items.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-12 text-center">
        <div className="mb-4 inline-flex rounded-full bg-muted p-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="mb-2 font-heading text-xl font-bold">Tu carrito está vacío</h2>
        <p className="mb-6 text-muted-foreground">Agrega productos para comenzar tu compra</p>
        <a
          href="/catalogo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="rounded-lg border">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <span className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </span>
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Items */}
          <ul className="divide-y">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4">
                {/* Image */}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                )}

                {/* Info */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(item.price)} c/u
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    {/* Quantity */}
                    <div className="flex items-center gap-1 rounded-lg border">
                      <button
                        type="button"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                        className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="font-bold text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Continue Shopping */}
        <div className="mt-4">
          <a
            href="/catalogo"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar comprando
          </a>
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 rounded-lg border p-6">
          <h2 className="mb-4 font-heading text-lg font-bold">Resumen</h2>

          {/* Coupon */}
          <div className="mb-6">
            {cart.couponCode ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">{cart.couponCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="rounded p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                  aria-label="Eliminar cupón"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <label htmlFor="coupon" className="mb-2 block text-sm font-medium">
                  Código de descuento
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Ingresa tu código"
                    className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm uppercase placeholder:normal-case placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="h-10 rounded-lg border bg-background px-4 font-medium transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {isApplyingCoupon ? '...' : 'Aplicar'}
                  </button>
                </div>
                {couponError && <p className="mt-2 text-sm text-destructive">{couponError}</p>}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-muted-foreground">Calculado en checkout</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-xl font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <a
            href="/checkout"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Finalizar compra
          </a>

          {/* Trust badges */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Compra segura • Envíos a todo el país</p>
          </div>
        </div>
      </div>
    </div>
  );
}
