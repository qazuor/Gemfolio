import { describe, expect, it } from 'vitest';
import {
  defaultOrganization,
  defaultWebSite,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  generateProductSchema,
  generateWebSiteSchema,
} from '../src/lib/seo';

describe('SEO Utilities', () => {
  describe('generateOrganizationSchema', () => {
    it('should generate basic organization schema', () => {
      const schema = generateOrganizationSchema({
        name: 'Test Company',
        url: 'https://test.com',
      });

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Company',
        url: 'https://test.com',
      });
    });

    it('should include optional logo', () => {
      const schema = generateOrganizationSchema({
        name: 'Test Company',
        url: 'https://test.com',
        logo: 'https://test.com/logo.png',
      });

      expect(schema).toHaveProperty('logo', 'https://test.com/logo.png');
    });

    it('should include optional description', () => {
      const schema = generateOrganizationSchema({
        name: 'Test Company',
        url: 'https://test.com',
        description: 'A great company',
      });

      expect(schema).toHaveProperty('description', 'A great company');
    });

    it('should include optional sameAs (social links)', () => {
      const schema = generateOrganizationSchema({
        name: 'Test Company',
        url: 'https://test.com',
        sameAs: ['https://instagram.com/test', 'https://twitter.com/test'],
      });

      expect(schema).toHaveProperty('sameAs');
      expect((schema as { sameAs: string[] }).sameAs).toHaveLength(2);
    });

    it('should generate full organization schema', () => {
      const schema = generateOrganizationSchema({
        name: 'Test Company',
        url: 'https://test.com',
        logo: 'https://test.com/logo.png',
        description: 'A great company',
        sameAs: ['https://instagram.com/test'],
      });

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Company',
        url: 'https://test.com',
        logo: 'https://test.com/logo.png',
        description: 'A great company',
        sameAs: ['https://instagram.com/test'],
      });
    });
  });

  describe('generateWebSiteSchema', () => {
    it('should generate basic website schema', () => {
      const schema = generateWebSiteSchema({
        name: 'Test Site',
        url: 'https://test.com',
      });

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Test Site',
        url: 'https://test.com',
      });
    });

    it('should include optional description', () => {
      const schema = generateWebSiteSchema({
        name: 'Test Site',
        url: 'https://test.com',
        description: 'A great website',
      });

      expect(schema).toHaveProperty('description', 'A great website');
    });

    it('should include search action', () => {
      const schema = generateWebSiteSchema({
        name: 'Test Site',
        url: 'https://test.com',
        potentialAction: {
          target: 'https://test.com/search?q={query}',
          queryInput: 'required name=query',
        },
      }) as Record<string, unknown>;

      expect(schema).toHaveProperty('potentialAction');
      expect(schema.potentialAction).toEqual({
        '@type': 'SearchAction',
        target: 'https://test.com/search?q={query}',
        'query-input': 'required name=query',
      });
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate breadcrumb schema for single item', () => {
      const schema = generateBreadcrumbSchema([{ name: 'Home', url: 'https://test.com' }]) as {
        itemListElement: Array<{ position: number; name: string }>;
      };

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(1);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].name).toBe('Home');
    });

    it('should generate breadcrumb schema for multiple items', () => {
      const schema = generateBreadcrumbSchema([
        { name: 'Home', url: 'https://test.com' },
        { name: 'Products', url: 'https://test.com/products' },
        { name: 'Rings', url: 'https://test.com/products/rings' },
      ]) as { itemListElement: Array<{ position: number; name: string }> };

      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[2].position).toBe(3);
      expect(schema.itemListElement[2].name).toBe('Rings');
    });

    it('should handle empty breadcrumbs', () => {
      const schema = generateBreadcrumbSchema([]) as {
        itemListElement: Array<{ position: number }>;
      };

      expect(schema.itemListElement).toHaveLength(0);
    });
  });

  describe('generateProductSchema', () => {
    it('should generate basic product schema', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        price: 15000,
      }) as Record<string, unknown>;

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe('Gold Ring');
      expect((schema.offers as Record<string, unknown>).price).toBe(15000);
      expect((schema.offers as Record<string, unknown>).priceCurrency).toBe('ARS');
    });

    it('should include optional description', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        price: 15000,
        description: 'Beautiful 18k gold ring',
      });

      expect(schema).toHaveProperty('description', 'Beautiful 18k gold ring');
    });

    it('should include single image', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        price: 15000,
        image: 'https://test.com/ring.jpg',
      });

      expect(schema).toHaveProperty('image', 'https://test.com/ring.jpg');
    });

    it('should include multiple images', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        price: 15000,
        image: ['https://test.com/ring1.jpg', 'https://test.com/ring2.jpg'],
      });

      expect(schema).toHaveProperty('image');
      expect((schema as { image: string[] }).image).toHaveLength(2);
    });

    it('should include SKU', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        price: 15000,
        sku: 'RING-001',
      });

      expect(schema).toHaveProperty('sku', 'RING-001');
    });

    it('should include brand', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        price: 15000,
        brand: 'Gemfolio',
      }) as Record<string, unknown>;

      expect(schema).toHaveProperty('brand');
      expect((schema.brand as Record<string, string>)['@type']).toBe('Brand');
      expect((schema.brand as Record<string, string>).name).toBe('Gemfolio');
    });

    it('should include category', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        price: 15000,
        category: 'Rings',
      });

      expect(schema).toHaveProperty('category', 'Rings');
    });

    it('should use custom currency', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        price: 100,
        currency: 'USD',
      }) as Record<string, unknown>;

      expect((schema.offers as Record<string, unknown>).priceCurrency).toBe('USD');
    });

    it('should handle different availability states', () => {
      const inStockSchema = generateProductSchema({
        name: 'Ring',
        price: 100,
        availability: 'InStock',
      }) as Record<string, unknown>;
      expect((inStockSchema.offers as Record<string, unknown>).availability).toBe(
        'https://schema.org/InStock'
      );

      const outOfStockSchema = generateProductSchema({
        name: 'Ring',
        price: 100,
        availability: 'OutOfStock',
      }) as Record<string, unknown>;
      expect((outOfStockSchema.offers as Record<string, unknown>).availability).toBe(
        'https://schema.org/OutOfStock'
      );

      const preOrderSchema = generateProductSchema({
        name: 'Ring',
        price: 100,
        availability: 'PreOrder',
      }) as Record<string, unknown>;
      expect((preOrderSchema.offers as Record<string, unknown>).availability).toBe(
        'https://schema.org/PreOrder'
      );
    });

    it('should include URL in offers', () => {
      const schema = generateProductSchema({
        name: 'Ring',
        price: 100,
        url: 'https://test.com/products/ring',
      }) as Record<string, unknown>;

      expect((schema.offers as Record<string, unknown>).url).toBe('https://test.com/products/ring');
    });

    it('should generate complete product schema', () => {
      const schema = generateProductSchema({
        name: 'Gold Ring',
        description: 'Beautiful 18k gold ring',
        image: 'https://test.com/ring.jpg',
        sku: 'RING-001',
        price: 15000,
        currency: 'ARS',
        availability: 'InStock',
        url: 'https://test.com/products/gold-ring',
        brand: 'Gemfolio',
        category: 'Rings',
      }) as Record<string, unknown>;

      expect(schema.name).toBe('Gold Ring');
      expect(schema.description).toBe('Beautiful 18k gold ring');
      expect(schema.image).toBe('https://test.com/ring.jpg');
      expect(schema.sku).toBe('RING-001');
      expect((schema.brand as Record<string, string>).name).toBe('Gemfolio');
      expect(schema.category).toBe('Rings');
    });
  });

  describe('generateItemListSchema', () => {
    it('should generate item list schema', () => {
      const schema = generateItemListSchema({
        name: 'Products',
        items: [
          { name: 'Ring 1', url: 'https://test.com/ring-1', position: 1 },
          { name: 'Ring 2', url: 'https://test.com/ring-2', position: 2 },
        ],
      }) as Record<string, unknown>;

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ItemList');
      expect(schema.name).toBe('Products');
      expect(schema.numberOfItems).toBe(2);
    });

    it('should include item images when provided', () => {
      const schema = generateItemListSchema({
        name: 'Products',
        items: [
          {
            name: 'Ring 1',
            url: 'https://test.com/ring-1',
            image: 'https://test.com/ring-1.jpg',
            position: 1,
          },
        ],
      }) as { itemListElement: Array<{ image: string }> };

      expect(schema.itemListElement[0].image).toBe('https://test.com/ring-1.jpg');
    });

    it('should not include image when not provided', () => {
      const schema = generateItemListSchema({
        name: 'Products',
        items: [{ name: 'Ring 1', url: 'https://test.com/ring-1', position: 1 }],
      }) as { itemListElement: Array<{ image?: string }> };

      expect(schema.itemListElement[0]).not.toHaveProperty('image');
    });

    it('should handle empty list', () => {
      const schema = generateItemListSchema({
        name: 'Products',
        items: [],
      }) as Record<string, unknown>;

      expect(schema.numberOfItems).toBe(0);
      expect((schema.itemListElement as unknown[]).length).toBe(0);
    });
  });

  describe('Default Data', () => {
    it('should have correct default organization data', () => {
      expect(defaultOrganization.name).toBe('Gemfolio');
      expect(defaultOrganization.url).toBe('https://gemfolio.com');
      expect(defaultOrganization.logo).toBe('https://gemfolio.com/logo.png');
      expect(defaultOrganization.description).toBeDefined();
      expect(defaultOrganization.sameAs).toHaveLength(2);
    });

    it('should have correct default website data', () => {
      expect(defaultWebSite.name).toBe('Gemfolio');
      expect(defaultWebSite.url).toBe('https://gemfolio.com');
      expect(defaultWebSite.potentialAction).toBeDefined();
      expect(defaultWebSite.potentialAction?.target).toContain('search_term_string');
    });

    it('should generate valid schema from default data', () => {
      const orgSchema = generateOrganizationSchema(defaultOrganization);
      const siteSchema = generateWebSiteSchema(defaultWebSite);

      expect(orgSchema).toHaveProperty('@context', 'https://schema.org');
      expect(siteSchema).toHaveProperty('@context', 'https://schema.org');
    });
  });
});
