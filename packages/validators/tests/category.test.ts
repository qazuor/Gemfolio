import { describe, expect, it } from 'vitest';
import {
  categoryAttributesSchema,
  categoryStatusSchema,
  createCategorySchema,
  reorderCategoriesSchema,
  updateCategorySchema,
} from '../src/category';

describe('Category Validators', () => {
  describe('categoryStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(categoryStatusSchema.parse('active')).toBe('active');
      expect(categoryStatusSchema.parse('inactive')).toBe('inactive');
    });

    it('should reject invalid statuses', () => {
      expect(() => categoryStatusSchema.parse('draft')).toThrow();
      expect(() => categoryStatusSchema.parse('')).toThrow();
    });
  });

  describe('createCategorySchema', () => {
    const validCategory = {
      name: 'Anillos',
      slug: 'anillos',
    };

    it('should accept valid category', () => {
      const result = createCategorySchema.parse(validCategory);
      expect(result.name).toBe('Anillos');
      expect(result.slug).toBe('anillos');
      expect(result.order).toBe(0);
      expect(result.status).toBe('active');
    });

    it('should accept category with all fields', () => {
      const fullCategory = {
        name: 'Anillos',
        slug: 'anillos',
        description: 'Colección de anillos',
        image: 'https://example.com/anillos.jpg',
        parentId: 'parent-1',
        order: 5,
        status: 'inactive',
        seoTitle: 'Anillos - Gemfolio',
        seoDescription: 'Descubre nuestra colección de anillos',
      };
      const result = createCategorySchema.parse(fullCategory);
      expect(result.description).toBe('Colección de anillos');
      expect(result.image).toBe('https://example.com/anillos.jpg');
      expect(result.parentId).toBe('parent-1');
      expect(result.status).toBe('inactive');
    });

    it('should reject empty name', () => {
      expect(() => createCategorySchema.parse({ ...validCategory, name: '' })).toThrow();
    });

    it('should reject name exceeding max length', () => {
      const longName = 'a'.repeat(256);
      expect(() => createCategorySchema.parse({ ...validCategory, name: longName })).toThrow();
    });

    it('should reject invalid slug format', () => {
      expect(() =>
        createCategorySchema.parse({ ...validCategory, slug: 'Invalid Slug' })
      ).toThrow();
      expect(() => createCategorySchema.parse({ ...validCategory, slug: 'UPPERCASE' })).toThrow();
    });

    it('should accept valid slug formats', () => {
      expect(createCategorySchema.parse({ ...validCategory, slug: 'anillos' }).slug).toBe(
        'anillos'
      );
      expect(createCategorySchema.parse({ ...validCategory, slug: 'anillos-oro' }).slug).toBe(
        'anillos-oro'
      );
      expect(createCategorySchema.parse({ ...validCategory, slug: 'anillos-18k-oro' }).slug).toBe(
        'anillos-18k-oro'
      );
    });

    it('should reject invalid image URL', () => {
      expect(() => createCategorySchema.parse({ ...validCategory, image: 'not-a-url' })).toThrow();
    });

    it('should accept null image', () => {
      const result = createCategorySchema.parse({ ...validCategory, image: null });
      expect(result.image).toBeNull();
    });

    it('should reject negative order', () => {
      expect(() => createCategorySchema.parse({ ...validCategory, order: -1 })).toThrow();
    });

    it('should enforce seoTitle max length', () => {
      const longTitle = 'a'.repeat(71);
      expect(() => createCategorySchema.parse({ ...validCategory, seoTitle: longTitle })).toThrow();
    });

    it('should enforce seoDescription max length', () => {
      const longDesc = 'a'.repeat(161);
      expect(() =>
        createCategorySchema.parse({ ...validCategory, seoDescription: longDesc })
      ).toThrow();
    });
  });

  describe('updateCategorySchema', () => {
    it('should accept partial updates', () => {
      const result = updateCategorySchema.parse({ name: 'Updated Category' });
      expect(result.name).toBe('Updated Category');
      expect(result.slug).toBeUndefined();
    });

    it('should accept empty object', () => {
      const result = updateCategorySchema.parse({});
      expect(result).toEqual({});
    });

    it('should still validate provided fields', () => {
      expect(() => updateCategorySchema.parse({ slug: 'Invalid Slug' })).toThrow();
    });
  });

  describe('reorderCategoriesSchema', () => {
    it('should accept valid reorder data', () => {
      const reorderData = {
        categories: [
          { id: 'cat-1', order: 0 },
          { id: 'cat-2', order: 1 },
          { id: 'cat-3', order: 2, parentId: 'cat-1' },
        ],
      };
      const result = reorderCategoriesSchema.parse(reorderData);
      expect(result.categories).toHaveLength(3);
      expect(result.categories[2].parentId).toBe('cat-1');
    });

    it('should accept empty categories array', () => {
      const result = reorderCategoriesSchema.parse({ categories: [] });
      expect(result.categories).toEqual([]);
    });

    it('should accept null parentId', () => {
      const result = reorderCategoriesSchema.parse({
        categories: [{ id: 'cat-1', order: 0, parentId: null }],
      });
      expect(result.categories[0].parentId).toBeNull();
    });

    it('should reject negative order', () => {
      expect(() =>
        reorderCategoriesSchema.parse({
          categories: [{ id: 'cat-1', order: -1 }],
        })
      ).toThrow();
    });

    it('should reject missing id', () => {
      expect(() =>
        reorderCategoriesSchema.parse({
          categories: [{ order: 0 }],
        })
      ).toThrow();
    });
  });

  describe('categoryAttributesSchema', () => {
    it('should accept valid category attributes', () => {
      const result = categoryAttributesSchema.parse({
        categoryId: 'cat-1',
        attributeIds: ['attr-1', 'attr-2'],
      });
      expect(result.categoryId).toBe('cat-1');
      expect(result.attributeIds).toEqual(['attr-1', 'attr-2']);
    });

    it('should accept empty attributeIds array', () => {
      const result = categoryAttributesSchema.parse({
        categoryId: 'cat-1',
        attributeIds: [],
      });
      expect(result.attributeIds).toEqual([]);
    });

    it('should reject missing categoryId', () => {
      expect(() => categoryAttributesSchema.parse({ attributeIds: ['attr-1'] })).toThrow();
    });
  });
});
