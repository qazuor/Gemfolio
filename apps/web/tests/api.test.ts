import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type BrandingSettings,
  defaultBrandingSettings,
  defaultGeneralSettings,
  defaultSeoSettings,
  defaultSocialSettings,
  generateCssVariables,
  getBundleBySlug,
  getBundles,
  getCategories,
  getCategoryBySlug,
  getFeaturedProducts,
  getFontFamilyCss,
  getGoogleFontsUrl,
  getNewProducts,
  getOfferProducts,
  getPageBySlug,
  getProductBySlug,
  getProducts,
  getPublicSettings,
  getRelatedProducts,
  type ProductFilters,
  searchProducts,
} from '../src/lib/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Utils', () => {
  describe('generateCssVariables', () => {
    it('should generate CSS variables from branding settings', () => {
      const result = generateCssVariables(defaultBrandingSettings);
      expect(result).toContain('--primary:');
      expect(result).toContain('--secondary:');
      expect(result).toContain('--accent:');
      expect(result).toContain('--radius:');
    });

    it('should convert hex colors to HSL format', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: '#FF0000', // Red
      };
      const result = generateCssVariables(branding);
      expect(result).toContain('--primary:');
    });

    it('should handle different border radius values', () => {
      const testCases: Array<BrandingSettings['borderRadius']> = [
        'none',
        'small',
        'medium',
        'large',
        'full',
      ];

      testCases.forEach((borderRadius) => {
        const branding = { ...defaultBrandingSettings, borderRadius };
        const result = generateCssVariables(branding);
        expect(result).toContain('--radius:');
      });
    });

    it('should handle black color (#000000)', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: '#000000',
      };
      const result = generateCssVariables(branding);
      expect(result).toContain('--primary:');
    });

    it('should handle white color (#FFFFFF)', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: '#FFFFFF',
      };
      const result = generateCssVariables(branding);
      expect(result).toContain('--primary:');
    });

    it('should handle invalid hex color gracefully', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: 'invalid',
      };
      const result = generateCssVariables(branding);
      expect(result).toContain('--primary:');
    });
  });

  describe('getGoogleFontsUrl', () => {
    it('should generate Google Fonts URL', () => {
      const result = getGoogleFontsUrl(defaultBrandingSettings);
      expect(result).toContain('https://fonts.googleapis.com/css2');
      expect(result).toContain('display=swap');
    });

    it('should include heading font', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        headingFont: 'playfair',
      };
      const result = getGoogleFontsUrl(branding);
      expect(result).toContain('Playfair');
    });

    it('should include body font', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        bodyFont: 'inter',
      };
      const result = getGoogleFontsUrl(branding);
      expect(result).toContain('Inter');
    });

    it('should handle different font combinations', () => {
      const fonts: Array<{
        heading: BrandingSettings['headingFont'];
        body: BrandingSettings['bodyFont'];
      }> = [
        { heading: 'cormorant', body: 'open-sans' },
        { heading: 'lora', body: 'roboto' },
        { heading: 'merriweather', body: 'lato' },
        { heading: 'libre-baskerville', body: 'source-sans' },
      ];

      fonts.forEach(({ heading, body }) => {
        const branding = { ...defaultBrandingSettings, headingFont: heading, bodyFont: body };
        const result = getGoogleFontsUrl(branding);
        expect(result).toContain('https://fonts.googleapis.com/css2');
      });
    });
  });

  describe('getFontFamilyCss', () => {
    it('should return heading and body font families', () => {
      const result = getFontFamilyCss(defaultBrandingSettings);
      expect(result).toHaveProperty('heading');
      expect(result).toHaveProperty('body');
    });

    it('should return serif fonts for headings', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        headingFont: 'playfair',
      };
      const result = getFontFamilyCss(branding);
      expect(result.heading).toContain('Playfair Display');
      expect(result.heading).toContain('serif');
    });

    it('should return sans-serif fonts for body', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        bodyFont: 'inter',
      };
      const result = getFontFamilyCss(branding);
      expect(result.body).toContain('Inter');
      expect(result.body).toContain('sans-serif');
    });

    it('should handle all heading font options', () => {
      const headingFonts: BrandingSettings['headingFont'][] = [
        'playfair',
        'cormorant',
        'libre-baskerville',
        'lora',
        'merriweather',
        'inter',
      ];

      headingFonts.forEach((font) => {
        const branding = { ...defaultBrandingSettings, headingFont: font };
        const result = getFontFamilyCss(branding);
        expect(typeof result.heading).toBe('string');
      });
    });

    it('should handle all body font options', () => {
      const bodyFonts: BrandingSettings['bodyFont'][] = [
        'inter',
        'open-sans',
        'roboto',
        'lato',
        'source-sans',
      ];

      bodyFonts.forEach((font) => {
        const branding = { ...defaultBrandingSettings, bodyFont: font };
        const result = getFontFamilyCss(branding);
        expect(typeof result.body).toBe('string');
      });
    });
  });

  describe('default settings', () => {
    describe('defaultBrandingSettings', () => {
      it('should have all required properties', () => {
        expect(defaultBrandingSettings.logo).toBeDefined();
        expect(defaultBrandingSettings.primaryColor).toBeDefined();
        expect(defaultBrandingSettings.headingFont).toBeDefined();
        expect(defaultBrandingSettings.bodyFont).toBeDefined();
        expect(defaultBrandingSettings.borderRadius).toBeDefined();
        expect(defaultBrandingSettings.headerStyle).toBeDefined();
        expect(defaultBrandingSettings.buttonStyle).toBeDefined();
        expect(defaultBrandingSettings.cardStyle).toBeDefined();
        expect(defaultBrandingSettings.heroStyle).toBeDefined();
      });

      it('should have valid color values', () => {
        expect(defaultBrandingSettings.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(defaultBrandingSettings.secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(defaultBrandingSettings.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    describe('defaultGeneralSettings', () => {
      it('should have all required properties', () => {
        expect(defaultGeneralSettings.businessName).toBeDefined();
        expect(defaultGeneralSettings.email).toBeDefined();
        expect(defaultGeneralSettings.phone).toBeDefined();
        expect(defaultGeneralSettings.address).toBeDefined();
        expect(defaultGeneralSettings.currency).toBeDefined();
        expect(defaultGeneralSettings.timezone).toBeDefined();
      });

      it('should have valid currency', () => {
        expect(['ARS', 'USD']).toContain(defaultGeneralSettings.currency);
      });
    });

    describe('defaultSeoSettings', () => {
      it('should have all required properties', () => {
        expect(defaultSeoSettings.siteTitle).toBeDefined();
        expect(defaultSeoSettings.siteDescription).toBeDefined();
        expect(defaultSeoSettings.ogImage).toBeDefined();
      });
    });

    describe('defaultSocialSettings', () => {
      it('should have social properties', () => {
        expect(defaultSocialSettings).toHaveProperty('instagram');
        expect(defaultSocialSettings).toHaveProperty('facebook');
        expect(defaultSocialSettings).toHaveProperty('whatsapp');
        expect(defaultSocialSettings).toHaveProperty('tiktok');
      });
    });
  });
});

describe('API Fetch Functions', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', slug: 'product-1' },
        { id: '2', name: 'Product 2', slug: 'product-2' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockProducts,
            meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
          }),
      });

      const result = await getProducts();
      expect(result.data).toEqual(mockProducts);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should apply filters to query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          }),
      });

      const filters: ProductFilters = {
        page: 2,
        limit: 20,
        categoryId: 'cat-1',
        status: 'active',
        minPrice: 10,
        maxPrice: 100,
        inStock: true,
        tag: 'featured',
        search: 'ring',
        sortBy: 'price',
        sortDirection: 'asc',
      };

      await getProducts(filters);
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=20');
      expect(calledUrl).toContain('categoryId=cat-1');
      expect(calledUrl).toContain('status=active');
      expect(calledUrl).toContain('minPrice=10');
      expect(calledUrl).toContain('maxPrice=100');
      expect(calledUrl).toContain('inStock=true');
      expect(calledUrl).toContain('tag=featured');
      expect(calledUrl).toContain('search=ring');
      expect(calledUrl).toContain('sortBy=price');
      expect(calledUrl).toContain('sortDirection=asc');
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getProducts()).rejects.toThrow('Error al cargar productos');
    });
  });

  describe('getProductBySlug', () => {
    it('should return product when found', async () => {
      const mockProduct = { id: '1', name: 'Product 1', slug: 'product-1' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockProduct }),
      });

      const result = await getProductBySlug('product-1');
      expect(result).toEqual(mockProduct);
    });

    it('should return null when product not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getProductBySlug('non-existent');
      expect(result).toBeNull();
    });

    it('should throw error on other errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getProductBySlug('product-1')).rejects.toThrow('Error al cargar producto');
    });
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [
        { id: '1', name: 'Category 1', slug: 'category-1' },
        { id: '2', name: 'Category 2', slug: 'category-2' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockCategories }),
      });

      const result = await getCategories();
      expect(result).toEqual(mockCategories);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getCategories()).rejects.toThrow('Error al cargar categorías');
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category with products when found', async () => {
      const mockCategoryData = {
        id: '1',
        name: 'Category 1',
        slug: 'category-1',
        products: [{ id: 'p1', name: 'Product 1' }],
        children: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockCategoryData }),
      });

      const result = await getCategoryBySlug('category-1');
      expect(result).toBeDefined();
      expect(result?.category.name).toBe('Category 1');
      expect(result?.products.data).toHaveLength(1);
    });

    it('should return null when category not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getCategoryBySlug('non-existent');
      expect(result).toBeNull();
    });

    it('should throw error on other errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getCategoryBySlug('category-1')).rejects.toThrow('Error al cargar categoría');
    });
  });

  describe('searchProducts', () => {
    it('should search products with query', async () => {
      const mockProducts = [{ id: '1', name: 'Gold Ring' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockProducts }),
      });

      const result = await searchProducts('gold', 5);
      expect(result).toEqual(mockProducts);
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('q=gold');
      expect(calledUrl).toContain('limit=5');
    });

    it('should throw error on failed search', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(searchProducts('gold')).rejects.toThrow('Error en búsqueda');
    });
  });

  describe('getFeaturedProducts', () => {
    it('should fetch featured products', async () => {
      const mockProducts = [{ id: '1', name: 'Featured Product' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockProducts,
            meta: { page: 1, limit: 8, total: 1, totalPages: 1 },
          }),
      });

      const result = await getFeaturedProducts(8);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getNewProducts', () => {
    it('should fetch new products', async () => {
      const mockProducts = [{ id: '1', name: 'New Product' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockProducts,
            meta: { page: 1, limit: 8, total: 1, totalPages: 1 },
          }),
      });

      const result = await getNewProducts(8);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getOfferProducts', () => {
    it('should fetch offer products', async () => {
      const mockProducts = [{ id: '1', name: 'Offer Product' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockProducts,
            meta: { page: 1, limit: 8, total: 1, totalPages: 1 },
          }),
      });

      const result = await getOfferProducts(8);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getRelatedProducts', () => {
    it('should fetch related products excluding current product', async () => {
      const mockProducts = [
        { id: '1', name: 'Related 1' },
        { id: '2', name: 'Related 2' },
        { id: 'current', name: 'Current' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockProducts,
            meta: { page: 1, limit: 5, total: 3, totalPages: 1 },
          }),
      });

      const result = await getRelatedProducts('cat-1', 'current', 4);
      expect(result.find((p) => p.id === 'current')).toBeUndefined();
      expect(result.length).toBeLessThanOrEqual(4);
    });
  });

  describe('getBundles', () => {
    it('should fetch bundles successfully', async () => {
      const mockBundles = [{ id: '1', name: 'Bundle 1' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockBundles }),
      });

      const result = await getBundles(10);
      expect(result).toEqual(mockBundles);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getBundles()).rejects.toThrow('Error al cargar bundles');
    });
  });

  describe('getBundleBySlug', () => {
    it('should return bundle when found', async () => {
      const mockBundle = { id: '1', name: 'Bundle 1', slug: 'bundle-1' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockBundle }),
      });

      const result = await getBundleBySlug('bundle-1');
      expect(result).toEqual(mockBundle);
    });

    it('should return null when bundle not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getBundleBySlug('non-existent');
      expect(result).toBeNull();
    });

    it('should throw error on other errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getBundleBySlug('bundle-1')).rejects.toThrow('Error al cargar bundle');
    });
  });

  describe('getPageBySlug', () => {
    it('should return page when found', async () => {
      const mockPage = { id: '1', title: 'About Us', slug: 'about' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockPage }),
      });

      const result = await getPageBySlug('about');
      expect(result).toEqual(mockPage);
    });

    it('should return null when page not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getPageBySlug('non-existent');
      expect(result).toBeNull();
    });

    it('should throw error on other errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getPageBySlug('about')).rejects.toThrow('Error al cargar página');
    });
  });

  describe('getPublicSettings', () => {
    it('should fetch public settings successfully', async () => {
      const mockSettings = {
        general: defaultGeneralSettings,
        branding: defaultBrandingSettings,
        seo: defaultSeoSettings,
        social: defaultSocialSettings,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockSettings }),
      });

      const result = await getPublicSettings();
      expect(result).toEqual(mockSettings);
    });

    it('should return defaults when fetch fails', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await getPublicSettings();
      expect(result.general).toEqual(defaultGeneralSettings);
      expect(result.branding).toEqual(defaultBrandingSettings);
      consoleSpy.mockRestore();
    });

    it('should return defaults when fetch throws error', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getPublicSettings();
      expect(result.general).toEqual(defaultGeneralSettings);
      expect(result.branding).toEqual(defaultBrandingSettings);
      consoleSpy.mockRestore();
    });
  });
});
