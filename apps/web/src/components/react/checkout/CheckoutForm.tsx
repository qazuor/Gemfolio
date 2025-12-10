import { useStore } from '@nanostores/react';
import { ArrowLeft, CheckCircle, Loader2, ShoppingBag } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import {
  $cart,
  $cartDiscount,
  $cartItemCount,
  $cartSubtotal,
  $cartTotal,
  clearCart,
} from '@/stores/cart';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

interface FormData {
  // Contact
  name: string;
  email: string;
  phone: string;
  // Shipping
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Notes
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Argentina',
  notes: '',
};

export default function CheckoutForm() {
  const cart = useStore($cart);
  const itemCount = useStore($cartItemCount);
  const subtotal = useStore($cartSubtotal);
  const discount = useStore($cartDiscount);
  const total = useStore($cartTotal);

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Shipping cost (could be calculated dynamically)
  const shippingCost = 2500;
  const grandTotal = total + shippingCost;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'La provincia es requerida';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'El código postal es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';

      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        items: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          bundleId: item.bundleId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        couponCode: cart.couponCode,
        subtotal,
        discount,
        shippingCost,
        total: grandTotal,
        notes: formData.notes,
      };

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al procesar el pedido');
      }

      const result = await response.json();

      // Clear cart
      clearCart();

      // Redirect to confirmation page
      window.location.href = `/confirmacion/${result.data.id}`;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty cart check
  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-lg border bg-muted/30 p-12 text-center">
        <div className="mb-4 inline-flex rounded-full bg-muted p-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="mb-2 font-heading text-xl font-bold">Tu carrito está vacío</h2>
        <p className="mb-6 text-muted-foreground">Agrega productos antes de proceder al checkout</p>
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
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-8">
          {/* Contact Information */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 font-heading text-lg font-bold">Información de contacto</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  Nombre completo *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.name ? 'border-destructive' : ''
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.email ? 'border-destructive' : ''
                    }`}
                    placeholder="juan@ejemplo.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                    Teléfono *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.phone ? 'border-destructive' : ''
                    }`}
                    placeholder="+54 11 1234-5678"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 font-heading text-lg font-bold">Dirección de envío</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
                  Dirección *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.address ? 'border-destructive' : ''
                  }`}
                  placeholder="Av. Corrientes 1234, Piso 5, Depto A"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-destructive">{errors.address}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
                    Ciudad *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.city ? 'border-destructive' : ''
                    }`}
                    placeholder="Buenos Aires"
                  />
                  {errors.city && <p className="mt-1 text-sm text-destructive">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="state" className="mb-1.5 block text-sm font-medium">
                    Provincia *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.state ? 'border-destructive' : ''
                    }`}
                    placeholder="Buenos Aires"
                  />
                  {errors.state && <p className="mt-1 text-sm text-destructive">{errors.state}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium">
                    Código postal *
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.postalCode ? 'border-destructive' : ''
                    }`}
                    placeholder="C1043"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-destructive">{errors.postalCode}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="mb-1.5 block text-sm font-medium">
                    País
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Argentina">Argentina</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 font-heading text-lg font-bold">Notas del pedido</h2>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Instrucciones especiales para el envío, notas adicionales..."
            />
          </div>

          {/* Back to cart - mobile only */}
          <div className="lg:hidden">
            <a
              href="/carrito"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al carrito
            </a>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-4 rounded-lg border p-6">
            <h2 className="mb-4 font-heading text-lg font-bold">Resumen del pedido</h2>

            {/* Items */}
            <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento ({cart.couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Confirmar pedido
                </>
              )}
            </button>

            {/* Trust */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Al confirmar, aceptas nuestros{' '}
              <a href="/terminos" className="underline hover:text-foreground">
                términos y condiciones
              </a>
            </p>

            {/* Back to cart - desktop */}
            <div className="mt-4 hidden text-center lg:block">
              <a
                href="/carrito"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al carrito
              </a>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
