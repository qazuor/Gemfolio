import { describe, expect, it } from 'vitest';
import {
  calculateDiscount,
  cn,
  formatDate,
  formatPrice,
  generateOrderNumber,
  getInitials,
  slugify,
  truncate,
} from '../lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});

describe('formatPrice', () => {
  it('should format price in ARS by default', () => {
    const result = formatPrice(1000);
    expect(result).toContain('1.000');
  });

  it('should respect custom locale and currency', () => {
    const result = formatPrice(1000, { currency: 'USD', locale: 'en-US' });
    expect(result).toContain('$');
    expect(result).toContain('1,000');
  });
});

describe('formatDate', () => {
  it('should format date in Spanish', () => {
    // Use explicit time to avoid timezone issues
    const result = formatDate(new Date('2024-01-15T12:00:00'));
    expect(result).toMatch(/enero.*2024/i);
  });

  it('should accept string dates', () => {
    const result = formatDate('2024-06-20T12:00:00');
    expect(result).toMatch(/junio.*2024/i);
  });
});

describe('slugify', () => {
  it('should create valid slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Anillo de Oro')).toBe('anillo-de-oro');
    expect(slugify('Collar Diamantes 18K')).toBe('collar-diamantes-18k');
  });

  it('should handle accents', () => {
    expect(slugify('Joyería Fina')).toBe('joyeria-fina');
    expect(slugify('Año Nuevo')).toBe('ano-nuevo');
  });
});

describe('truncate', () => {
  it('should truncate long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate short text', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });
});

describe('generateOrderNumber', () => {
  it('should generate order number with correct format', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^GEM-\d{4}-[A-Z0-9]{4}$/);
  });
});

describe('getInitials', () => {
  it('should get initials from name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('María García López')).toBe('MG');
    expect(getInitials('Admin')).toBe('A');
  });
});

describe('calculateDiscount', () => {
  it('should calculate discount percentage', () => {
    expect(calculateDiscount(80, 100)).toBe(20);
    expect(calculateDiscount(50, 100)).toBe(50);
  });

  it('should return 0 if no discount', () => {
    expect(calculateDiscount(100, 100)).toBe(0);
    expect(calculateDiscount(100, 80)).toBe(0);
    expect(calculateDiscount(100, 0)).toBe(0);
  });
});
