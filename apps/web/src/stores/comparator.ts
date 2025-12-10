import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';

// Maximum number of products that can be compared
export const MAX_COMPARE_ITEMS = 4;

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image?: string;
  category?: string;
  // Attributes for comparison (e.g., material, weight, etc.)
  attributes: Record<string, string | number | boolean | null>;
}

// Persistent comparator state
export const $comparator = persistentAtom<CompareProduct[]>('gemfolio-comparator', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Computed values
export const $compareCount = computed($comparator, (products) => products.length);

export const $canAddToCompare = computed(
  $comparator,
  (products) => products.length < MAX_COMPARE_ITEMS
);

export const $compareProductIds = computed($comparator, (products) => products.map((p) => p.id));

// Check if a specific product is in the comparator
export function isInComparator(productId: string): boolean {
  return $comparator.get().some((p) => p.id === productId);
}

// Actions
export function addToCompare(product: CompareProduct): boolean {
  const products = $comparator.get();

  // Check if already in comparator
  if (products.some((p) => p.id === product.id)) {
    return false;
  }

  // Check max limit
  if (products.length >= MAX_COMPARE_ITEMS) {
    return false;
  }

  $comparator.set([...products, product]);
  return true;
}

export function removeFromCompare(productId: string): void {
  const products = $comparator.get();
  $comparator.set(products.filter((p) => p.id !== productId));
}

export function toggleCompare(product: CompareProduct): boolean {
  const products = $comparator.get();
  const existingIndex = products.findIndex((p) => p.id === product.id);

  if (existingIndex > -1) {
    // Remove from comparator
    $comparator.set(products.filter((p) => p.id !== product.id));
    return false;
  }

  // Check max limit
  if (products.length >= MAX_COMPARE_ITEMS) {
    return false;
  }

  // Add to comparator
  $comparator.set([...products, product]);
  return true;
}

export function clearComparator(): void {
  $comparator.set([]);
}

// Get all unique attributes from compared products
export function getCompareAttributes(): string[] {
  const products = $comparator.get();
  const attributeSet = new Set<string>();

  for (const product of products) {
    for (const key of Object.keys(product.attributes)) {
      attributeSet.add(key);
    }
  }

  return Array.from(attributeSet).sort();
}

// Get comparison data organized by attribute
export function getComparisonData(): {
  products: CompareProduct[];
  attributes: Array<{
    name: string;
    values: Array<{ productId: string; value: string | number | boolean | null }>;
  }>;
} {
  const products = $comparator.get();
  const attributeNames = getCompareAttributes();

  const attributes = attributeNames.map((name) => ({
    name,
    values: products.map((product) => ({
      productId: product.id,
      value: product.attributes[name] ?? null,
    })),
  }));

  return {
    products,
    attributes,
  };
}
