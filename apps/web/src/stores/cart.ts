import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  bundleId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
  maxQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  couponCode?: string;
  couponDiscount?: number;
}

// Persistent cart state
export const $cart = persistentAtom<CartState>(
  'gemfolio-cart',
  { items: [] },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

// Computed values
export const $cartItems = computed($cart, (cart) => cart.items);

export const $cartItemCount = computed($cart, (cart) =>
  cart.items.reduce((total, item) => total + item.quantity, 0)
);

export const $cartSubtotal = computed($cart, (cart) =>
  cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const $cartDiscount = computed($cart, (cart) => cart.couponDiscount ?? 0);

export const $cartTotal = computed(
  [$cartSubtotal, $cartDiscount],
  (subtotal, discount) => subtotal - discount
);

// Actions
export function addToCart(item: Omit<CartItem, 'id'>) {
  const cart = $cart.get();
  const existingIndex = cart.items.findIndex(
    (i) =>
      i.productId === item.productId &&
      i.variantId === item.variantId &&
      i.bundleId === item.bundleId
  );

  if (existingIndex > -1) {
    // Update quantity
    const newItems = [...cart.items];
    const existing = newItems[existingIndex]!;
    const newQuantity = existing.quantity + item.quantity;

    // Check max quantity
    if (item.maxQuantity && newQuantity > item.maxQuantity) {
      newItems[existingIndex] = { ...existing, quantity: item.maxQuantity };
    } else {
      newItems[existingIndex] = { ...existing, quantity: newQuantity };
    }

    $cart.set({ ...cart, items: newItems });
  } else {
    // Add new item
    const newItem: CartItem = {
      ...item,
      id: generateCartItemId(),
    };
    $cart.set({ ...cart, items: [...cart.items, newItem] });
  }
}

export function updateCartItemQuantity(itemId: string, quantity: number) {
  const cart = $cart.get();
  const newItems = cart.items
    .map((item) => (item.id === itemId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  $cart.set({ ...cart, items: newItems });
}

export function removeCartItem(itemId: string) {
  const cart = $cart.get();
  $cart.set({
    ...cart,
    items: cart.items.filter((item) => item.id !== itemId),
  });
}

export function clearCart() {
  $cart.set({ items: [] });
}

export function applyCoupon(code: string, discount: number) {
  const cart = $cart.get();
  $cart.set({
    ...cart,
    couponCode: code,
    couponDiscount: discount,
  });
}

export function removeCoupon() {
  const cart = $cart.get();
  $cart.set({
    ...cart,
    couponCode: undefined,
    couponDiscount: undefined,
  });
}

// Helpers
function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
