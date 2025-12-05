import { describe, expect, it } from 'vitest';
import {
  createPageSchema,
  pageFiltersSchema,
  pageStatusSchema,
  updatePageSchema,
} from '../src/page';

describe('Page Validators', () => {
  describe('pageStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(pageStatusSchema.parse('draft')).toBe('draft');
      expect(pageStatusSchema.parse('published')).toBe('published');
    });

    it('should reject invalid statuses', () => {
      expect(() => pageStatusSchema.parse('active')).toThrow();
      expect(() => pageStatusSchema.parse('')).toThrow();
    });
  });

  describe('createPageSchema', () => {
    const validPage = {
      title: 'Política de Privacidad',
      slug: 'politica-privacidad',
      content: 'Contenido de la página de privacidad...',
    };

    it('should accept valid page', () => {
      const result = createPageSchema.parse(validPage);
      expect(result.title).toBe('Política de Privacidad');
      expect(result.slug).toBe('politica-privacidad');
      expect(result.content).toBe('Contenido de la página de privacidad...');
      expect(result.status).toBe('draft');
    });

    it('should accept page with all fields', () => {
      const fullPage = {
        ...validPage,
        status: 'published',
        seoTitle: 'Política de Privacidad - Gemfolio',
        seoDescription: 'Lee nuestra política de privacidad',
      };
      const result = createPageSchema.parse(fullPage);
      expect(result.status).toBe('published');
      expect(result.seoTitle).toBe('Política de Privacidad - Gemfolio');
      expect(result.seoDescription).toBe('Lee nuestra política de privacidad');
    });

    it('should reject empty title', () => {
      expect(() => createPageSchema.parse({ ...validPage, title: '' })).toThrow();
    });

    it('should reject title exceeding max length', () => {
      const longTitle = 'a'.repeat(256);
      expect(() => createPageSchema.parse({ ...validPage, title: longTitle })).toThrow();
    });

    it('should reject invalid slug format', () => {
      expect(() => createPageSchema.parse({ ...validPage, slug: 'Invalid Slug' })).toThrow();
      expect(() => createPageSchema.parse({ ...validPage, slug: 'UPPERCASE' })).toThrow();
    });

    it('should accept valid slug formats', () => {
      expect(createPageSchema.parse({ ...validPage, slug: 'about' }).slug).toBe('about');
      expect(createPageSchema.parse({ ...validPage, slug: 'about-us' }).slug).toBe('about-us');
      expect(createPageSchema.parse({ ...validPage, slug: 'terms-and-conditions' }).slug).toBe(
        'terms-and-conditions'
      );
    });

    it('should reject empty content', () => {
      expect(() => createPageSchema.parse({ ...validPage, content: '' })).toThrow();
    });

    it('should enforce seoTitle max length', () => {
      const longSeoTitle = 'a'.repeat(71);
      expect(() => createPageSchema.parse({ ...validPage, seoTitle: longSeoTitle })).toThrow();
    });

    it('should enforce seoDescription max length', () => {
      const longSeoDesc = 'a'.repeat(161);
      expect(() => createPageSchema.parse({ ...validPage, seoDescription: longSeoDesc })).toThrow();
    });
  });

  describe('updatePageSchema', () => {
    it('should accept partial updates', () => {
      const result = updatePageSchema.parse({ title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('should accept empty object', () => {
      const result = updatePageSchema.parse({});
      expect(result).toEqual({});
    });

    it('should still validate provided fields', () => {
      expect(() => updatePageSchema.parse({ slug: 'Invalid Slug' })).toThrow();
    });

    it('should accept status update', () => {
      const result = updatePageSchema.parse({ status: 'published' });
      expect(result.status).toBe('published');
    });
  });

  describe('pageFiltersSchema', () => {
    it('should accept valid filters', () => {
      const filters = {
        status: 'published',
        search: 'privacidad',
      };
      const result = pageFiltersSchema.parse(filters);
      expect(result).toEqual(filters);
    });

    it('should accept empty filters', () => {
      const result = pageFiltersSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject invalid status', () => {
      expect(() => pageFiltersSchema.parse({ status: 'invalid' })).toThrow();
    });
  });
});
