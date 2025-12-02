import { describe, expect, it } from 'vitest';
import { cn, formatDate, formatPrice, generateId, slugify, truncate } from '../src/lib/utils';

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle arrays and objects', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });
});

describe('formatPrice', () => {
  it('should format price in ARS by default', () => {
    const result = formatPrice(1500);
    expect(result).toContain('1.500');
    expect(result).toMatch(/\$|ARS/);
  });

  it('should handle decimal prices', () => {
    const result = formatPrice(1500.5);
    expect(result).toContain('1.500');
  });

  it('should format price with custom currency', () => {
    const result = formatPrice(100, { currency: 'USD', locale: 'en-US' });
    expect(result).toContain('$');
    expect(result).toContain('100');
  });

  it('should handle zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  it('should handle large numbers', () => {
    const result = formatPrice(1000000);
    expect(result).toContain('1.000.000');
  });
});

describe('formatDate', () => {
  it('should format Date object', () => {
    // Use ISO string with time to avoid timezone issues
    const date = new Date('2024-03-15T12:00:00');
    const result = formatDate(date);
    expect(result).toContain('15');
    expect(result).toMatch(/marzo|march/i);
    expect(result).toContain('2024');
  });

  it('should format date string', () => {
    // Use ISO string with time to avoid timezone issues
    const result = formatDate('2024-12-25T12:00:00');
    expect(result).toContain('25');
    expect(result).toMatch(/diciembre|december/i);
    expect(result).toContain('2024');
  });

  it('should accept custom options', () => {
    const result = formatDate('2024-03-15T12:00:00', { month: 'short' });
    expect(result).toMatch(/mar/i);
  });
});

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('should remove accents', () => {
    expect(slugify('café con leche')).toBe('cafe-con-leche');
    expect(slugify('niño')).toBe('nino');
    expect(slugify('señor')).toBe('senor');
  });

  it('should remove special characters', () => {
    expect(slugify('hello@world!')).toBe('hello-world');
    expect(slugify('product #123')).toBe('product-123');
  });

  it('should handle multiple spaces/hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world');
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('should remove leading/trailing hyphens', () => {
    expect(slugify(' hello world ')).toBe('hello-world');
    expect(slugify('---hello---')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('truncate', () => {
  it('should truncate long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should handle exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('should trim whitespace before adding ellipsis', () => {
    expect(truncate('Hello World', 6)).toBe('Hello...');
  });

  it('should handle empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});

describe('generateId', () => {
  it('should generate a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('should generate non-empty id', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('should generate alphanumeric ids', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});
