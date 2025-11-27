import { createId as cuid2 } from '@paralleldrive/cuid2';

/**
 * Generate a unique CUID2 identifier
 */
export function createId(): string {
  return cuid2();
}

/**
 * Generate a slug from text
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate an order number in format GEM-YYMM-XXXX
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GEM-${year}${month}-${random}`;
}
