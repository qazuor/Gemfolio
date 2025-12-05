import { describe, expect, it } from 'vitest';
import {
  createProductSchema,
  productFiltersSchema,
  productImageSchema,
  productPaginationSchema,
  productStatusSchema,
  productVariantSchema,
  reorderImagesSchema,
  updateProductSchema,
} from '../src/product';

describe('Product Validators', () => {
  describe('productStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(productStatusSchema.parse('draft')).toBe('draft');
      expect(productStatusSchema.parse('active')).toBe('active');
      expect(productStatusSchema.parse('archived')).toBe('archived');
    });

    it('should reject invalid statuses', () => {
      expect(() => productStatusSchema.parse('invalid')).toThrow();
      expect(() => productStatusSchema.parse('')).toThrow();
    });
  });

  describe('productVariantSchema', () => {
    it('should accept valid variant', () => {
      const variant = {
        sku: 'SKU-001',
        name: 'Variante 1',
        price: '100.00',
        stock: 10,
      };
      const result = productVariantSchema.parse(variant);
      expect(result.sku).toBe('SKU-001');
      expect(result.name).toBe('Variante 1');
      expect(result.price).toBe('100.00');
      expect(result.stock).toBe(10);
      expect(result.lowStockThreshold).toBe(5);
      expect(result.attributes).toEqual({});
      expect(result.isDefault).toBe(false);
    });

    it('should accept variant with all fields', () => {
      const variant = {
        id: 'variant-1',
        sku: 'SKU-001',
        name: 'Variante 1',
        price: '100.00',
        comparePrice: '120.00',
        stock: 10,
        lowStockThreshold: 3,
        attributes: { size: 'M', color: 'gold' },
        image: 'https://example.com/image.jpg',
        isDefault: true,
      };
      const result = productVariantSchema.parse(variant);
      expect(result.id).toBe('variant-1');
      expect(result.comparePrice).toBe('120.00');
      expect(result.attributes).toEqual({ size: 'M', color: 'gold' });
      expect(result.image).toBe('https://example.com/image.jpg');
      expect(result.isDefault).toBe(true);
    });

    it('should reject variant without required fields', () => {
      expect(() => productVariantSchema.parse({})).toThrow();
      expect(() => productVariantSchema.parse({ sku: '' })).toThrow();
      expect(() => productVariantSchema.parse({ sku: 'SKU', name: '' })).toThrow();
    });

    it('should reject invalid price format', () => {
      expect(() =>
        productVariantSchema.parse({
          sku: 'SKU-001',
          name: 'Variante',
          price: 'invalid',
          stock: 10,
        })
      ).toThrow();
    });

    it('should reject negative stock', () => {
      expect(() =>
        productVariantSchema.parse({
          sku: 'SKU-001',
          name: 'Variante',
          price: '100.00',
          stock: -1,
        })
      ).toThrow();
    });

    it('should reject invalid image URL', () => {
      expect(() =>
        productVariantSchema.parse({
          sku: 'SKU-001',
          name: 'Variante',
          price: '100.00',
          stock: 10,
          image: 'not-a-url',
        })
      ).toThrow();
    });
  });

  describe('productImageSchema', () => {
    it('should accept valid image', () => {
      const image = { url: 'https://example.com/image.jpg' };
      const result = productImageSchema.parse(image);
      expect(result.url).toBe('https://example.com/image.jpg');
      expect(result.order).toBe(0);
      expect(result.isPrimary).toBe(false);
    });

    it('should accept image with all fields', () => {
      const image = {
        id: 'img-1',
        url: 'https://example.com/image.jpg',
        alt: 'Product image',
        order: 1,
        isPrimary: true,
      };
      const result = productImageSchema.parse(image);
      expect(result.id).toBe('img-1');
      expect(result.alt).toBe('Product image');
      expect(result.order).toBe(1);
      expect(result.isPrimary).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(() => productImageSchema.parse({ url: 'not-a-url' })).toThrow();
    });

    it('should reject negative order', () => {
      expect(() =>
        productImageSchema.parse({
          url: 'https://example.com/image.jpg',
          order: -1,
        })
      ).toThrow();
    });
  });

  describe('createProductSchema', () => {
    const validProduct = {
      name: 'Anillo de Oro',
      slug: 'anillo-de-oro',
      categoryId: 'cat-1',
      price: '150.00',
    };

    it('should accept valid product', () => {
      const result = createProductSchema.parse(validProduct);
      expect(result.name).toBe('Anillo de Oro');
      expect(result.slug).toBe('anillo-de-oro');
      expect(result.categoryId).toBe('cat-1');
      expect(result.price).toBe('150.00');
      expect(result.status).toBe('draft');
      expect(result.stock).toBe(0);
      expect(result.trackInventory).toBe(true);
      expect(result.hasVariants).toBe(false);
    });

    it('should accept product with all fields', () => {
      const fullProduct = {
        ...validProduct,
        description: 'Hermoso anillo de oro',
        shortDescription: 'Anillo oro 18k',
        comparePrice: '180.00',
        cost: '80.00',
        sku: 'ANI-001',
        stock: 25,
        lowStockThreshold: 5,
        trackInventory: true,
        hasVariants: true,
        status: 'active',
        seoTitle: 'Anillo de Oro - Gemfolio',
        seoDescription: 'Compra tu anillo de oro 18k',
        variants: [
          { sku: 'ANI-S', name: 'Small', price: '150.00', stock: 10 },
          { sku: 'ANI-M', name: 'Medium', price: '160.00', stock: 15 },
        ],
        images: [{ url: 'https://example.com/anillo.jpg', isPrimary: true }],
        tagIds: ['tag-1', 'tag-2'],
      };
      const result = createProductSchema.parse(fullProduct);
      expect(result.description).toBe('Hermoso anillo de oro');
      expect(result.variants).toHaveLength(2);
      expect(result.images).toHaveLength(1);
      expect(result.tagIds).toEqual(['tag-1', 'tag-2']);
    });

    it('should reject empty name', () => {
      expect(() => createProductSchema.parse({ ...validProduct, name: '' })).toThrow();
    });

    it('should reject invalid slug format', () => {
      expect(() => createProductSchema.parse({ ...validProduct, slug: 'Invalid Slug' })).toThrow();
      expect(() => createProductSchema.parse({ ...validProduct, slug: 'UPPERCASE' })).toThrow();
      expect(() => createProductSchema.parse({ ...validProduct, slug: 'with spaces' })).toThrow();
    });

    it('should accept valid slug formats', () => {
      const result1 = createProductSchema.parse({ ...validProduct, slug: 'simple' });
      expect(result1.slug).toBe('simple');

      const result2 = createProductSchema.parse({ ...validProduct, slug: 'with-dashes' });
      expect(result2.slug).toBe('with-dashes');

      const result3 = createProductSchema.parse({ ...validProduct, slug: 'with-123-numbers' });
      expect(result3.slug).toBe('with-123-numbers');
    });

    it('should reject empty categoryId', () => {
      expect(() => createProductSchema.parse({ ...validProduct, categoryId: '' })).toThrow();
    });

    it('should reject invalid price format', () => {
      expect(() => createProductSchema.parse({ ...validProduct, price: 'abc' })).toThrow();
      expect(() => createProductSchema.parse({ ...validProduct, price: '100.123' })).toThrow();
    });

    it('should accept valid price formats', () => {
      expect(createProductSchema.parse({ ...validProduct, price: '100' }).price).toBe('100');
      expect(createProductSchema.parse({ ...validProduct, price: '100.5' }).price).toBe('100.5');
      expect(createProductSchema.parse({ ...validProduct, price: '100.50' }).price).toBe('100.50');
    });

    it('should enforce seoTitle max length', () => {
      const longTitle = 'a'.repeat(71);
      expect(() => createProductSchema.parse({ ...validProduct, seoTitle: longTitle })).toThrow();
    });

    it('should enforce seoDescription max length', () => {
      const longDesc = 'a'.repeat(161);
      expect(() =>
        createProductSchema.parse({ ...validProduct, seoDescription: longDesc })
      ).toThrow();
    });
  });

  describe('updateProductSchema', () => {
    it('should accept partial updates', () => {
      const result = updateProductSchema.parse({ name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
      expect(result.slug).toBeUndefined();
    });

    it('should accept empty object', () => {
      const result = updateProductSchema.parse({});
      expect(result).toEqual({});
    });

    it('should still validate provided fields', () => {
      expect(() => updateProductSchema.parse({ slug: 'Invalid Slug' })).toThrow();
    });
  });

  describe('productFiltersSchema', () => {
    it('should accept valid filters', () => {
      const filters = {
        categoryId: 'cat-1',
        status: 'active',
        minPrice: 100,
        maxPrice: 500,
        inStock: true,
        tagId: 'tag-1',
        search: 'anillo',
      };
      const result = productFiltersSchema.parse(filters);
      expect(result).toEqual(filters);
    });

    it('should accept empty filters', () => {
      const result = productFiltersSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject negative prices', () => {
      expect(() => productFiltersSchema.parse({ minPrice: -10 })).toThrow();
    });

    it('should reject invalid status', () => {
      expect(() => productFiltersSchema.parse({ status: 'invalid' })).toThrow();
    });
  });

  describe('productPaginationSchema', () => {
    it('should apply defaults', () => {
      const result = productPaginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
    });

    it('should accept valid pagination', () => {
      const pagination = {
        page: 2,
        limit: 50,
        sortBy: 'price',
        sortOrder: 'asc',
      };
      const result = productPaginationSchema.parse(pagination);
      expect(result).toEqual(pagination);
    });

    it('should reject page less than 1', () => {
      expect(() => productPaginationSchema.parse({ page: 0 })).toThrow();
    });

    it('should reject limit greater than 100', () => {
      expect(() => productPaginationSchema.parse({ limit: 101 })).toThrow();
    });

    it('should reject invalid sortBy', () => {
      expect(() => productPaginationSchema.parse({ sortBy: 'invalid' })).toThrow();
    });

    it('should reject invalid sortOrder', () => {
      expect(() => productPaginationSchema.parse({ sortOrder: 'random' })).toThrow();
    });
  });

  describe('reorderImagesSchema', () => {
    it('should accept valid image IDs', () => {
      const result = reorderImagesSchema.parse({ imageIds: ['img-1', 'img-2', 'img-3'] });
      expect(result.imageIds).toEqual(['img-1', 'img-2', 'img-3']);
    });

    it('should reject empty array', () => {
      expect(() => reorderImagesSchema.parse({ imageIds: [] })).toThrow();
    });
  });
});
