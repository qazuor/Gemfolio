import { describe, expect, it } from 'vitest';

import {
  calculateDiscount,
  cn,
  formatDate,
  formatPrice,
  formatRelativeDate,
  generateOrderNumber,
  getInitials,
  slugify,
  truncate,
} from '../src/lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('formatPrice', () => {
  it('should format price with ARS currency by default', () => {
    const result = formatPrice(1234.56);
    expect(result).toContain('1.234');
  });

  it('should handle zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  it('should handle custom currency', () => {
    const result = formatPrice(100, { currency: 'USD' });
    expect(result).toContain('100');
  });
});

describe('formatDate', () => {
  it('should format date in Spanish', () => {
    // Use a date with time to avoid timezone issues
    const date = new Date('2024-03-15T12:00:00');
    const result = formatDate(date);
    expect(result).toContain('2024');
    expect(result).toContain('marzo');
  });

  it('should handle string dates', () => {
    const result = formatDate('2024-06-20T12:00:00');
    expect(result).toContain('junio');
  });
});

describe('formatRelativeDate', () => {
  it('should return "hace unos segundos" for recent dates', () => {
    const now = new Date();
    const result = formatRelativeDate(now);
    expect(result).toBe('hace unos segundos');
  });

  it('should return minutes for dates within an hour', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatRelativeDate(date);
    expect(result).toContain('minutos');
  });
});

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle accented characters', () => {
    expect(slugify('Café Résumé')).toBe('cafe-resume');
  });

  it('should handle Spanish characters', () => {
    expect(slugify('Joyería Fina')).toBe('joyeria-fina');
  });
});

describe('truncate', () => {
  it('should not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should truncate long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should return exact length text without ellipsis', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('generateOrderNumber', () => {
  it('should generate order number with correct format', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^GEM-\d{4}-[A-Z0-9]{4}$/);
  });

  it('should generate unique order numbers', () => {
    const order1 = generateOrderNumber();
    const order2 = generateOrderNumber();
    expect(order1).not.toBe(order2);
  });
});

describe('getInitials', () => {
  it('should return initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should handle single word', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should limit to 2 characters', () => {
    expect(getInitials('John Paul Smith')).toBe('JP');
  });
});

describe('calculateDiscount', () => {
  it('should calculate percentage discount', () => {
    expect(calculateDiscount(80, 100)).toBe(20);
  });

  it('should return 0 if no compare price', () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });

  it('should return 0 if compare price is lower', () => {
    expect(calculateDiscount(100, 80)).toBe(0);
  });

  it('should round to nearest integer', () => {
    expect(calculateDiscount(75, 100)).toBe(25);
  });
});
