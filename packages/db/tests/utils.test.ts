import { describe, expect, it } from 'vitest';

import { createId, generateOrderNumber, slugify } from '../src/utils';

describe('createId', () => {
  it('should create a unique ID', () => {
    const id1 = createId();
    const id2 = createId();

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it('should create ID with correct format', () => {
    const id = createId();
    // cuid2 generates IDs that are alphanumeric
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world test')).toBe('hello-world-test');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello! @World# $Test%')).toBe('hello-world-test');
  });

  it('should handle accented characters', () => {
    expect(slugify('Café Résumé')).toBe('cafe-resume');
  });

  it('should remove multiple consecutive hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle numbers', () => {
    expect(slugify('Product 123')).toBe('product-123');
  });

  it('should handle Spanish characters', () => {
    expect(slugify('Anillo de Oro con Diamante')).toBe('anillo-de-oro-con-diamante');
    expect(slugify('Joyería Fina')).toBe('joyeria-fina');
    expect(slugify('Año Nuevo')).toBe('ano-nuevo');
  });
});

describe('generateOrderNumber', () => {
  it('should generate order number with correct prefix', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^GEM-/);
  });

  it('should generate unique order numbers', () => {
    const orderNumber1 = generateOrderNumber();
    const orderNumber2 = generateOrderNumber();

    expect(orderNumber1).not.toBe(orderNumber2);
  });

  it('should match expected format GEM-YYMM-XXXX', () => {
    const orderNumber = generateOrderNumber();
    // Format: GEM-YYMM-XXXX
    expect(orderNumber).toMatch(/^GEM-\d{4}-[A-Z0-9]{4}$/);
  });

  it('should include current year and month', () => {
    const orderNumber = generateOrderNumber();
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    expect(orderNumber).toContain(`GEM-${year}${month}`);
  });
});
