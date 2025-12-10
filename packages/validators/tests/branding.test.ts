import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// Define the branding schema (matching the one in BrandingSettingsForm)
const brandingSchema = z.object({
  logo: z.string().url('URL inválida').or(z.literal('')),
  logoDark: z.string().url('URL inválida').or(z.literal('')),
  favicon: z.string().url('URL inválida').or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
  headingFont: z.enum([
    'playfair',
    'cormorant',
    'libre-baskerville',
    'lora',
    'merriweather',
    'inter',
  ]),
  bodyFont: z.enum(['inter', 'open-sans', 'roboto', 'lato', 'source-sans']),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']),
  headerStyle: z.enum(['transparent', 'solid', 'gradient']),
  buttonStyle: z.enum(['solid', 'outline', 'soft']),
  cardStyle: z.enum(['minimal', 'bordered', 'elevated', 'glass']),
  heroStyle: z.enum(['full', 'split', 'minimal']),
  showFeaturedCategories: z.boolean(),
  showTestimonials: z.boolean(),
  showNewsletter: z.boolean(),
});

describe('Branding Schema Validation', () => {
  const validBranding = {
    logo: 'https://example.com/logo.png',
    logoDark: 'https://example.com/logo-dark.png',
    favicon: 'https://example.com/favicon.ico',
    primaryColor: '#B8860B',
    secondaryColor: '#1A1A1A',
    accentColor: '#D4AF37',
    headingFont: 'playfair' as const,
    bodyFont: 'inter' as const,
    borderRadius: 'medium' as const,
    headerStyle: 'solid' as const,
    buttonStyle: 'solid' as const,
    cardStyle: 'elevated' as const,
    heroStyle: 'full' as const,
    showFeaturedCategories: true,
    showTestimonials: true,
    showNewsletter: true,
  };

  describe('Logo fields', () => {
    it('should accept valid logo URLs', () => {
      const result = brandingSchema.parse(validBranding);
      expect(result.logo).toBe('https://example.com/logo.png');
    });

    it('should accept empty logo string', () => {
      const data = { ...validBranding, logo: '' };
      const result = brandingSchema.parse(data);
      expect(result.logo).toBe('');
    });

    it('should reject invalid logo URL', () => {
      const data = { ...validBranding, logo: 'not-a-url' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should accept empty logoDark string', () => {
      const data = { ...validBranding, logoDark: '' };
      const result = brandingSchema.parse(data);
      expect(result.logoDark).toBe('');
    });

    it('should accept empty favicon string', () => {
      const data = { ...validBranding, favicon: '' };
      const result = brandingSchema.parse(data);
      expect(result.favicon).toBe('');
    });

    it('should accept various image URL formats', () => {
      const urls = [
        'https://example.com/logo.png',
        'https://cdn.example.com/images/logo.jpg',
        'https://storage.googleapis.com/bucket/logo.svg',
        'https://example.com/logo?v=123',
      ];

      for (const url of urls) {
        const data = { ...validBranding, logo: url };
        const result = brandingSchema.parse(data);
        expect(result.logo).toBe(url);
      }
    });
  });

  describe('Color fields', () => {
    it('should accept valid hex colors', () => {
      const result = brandingSchema.parse(validBranding);
      expect(result.primaryColor).toBe('#B8860B');
      expect(result.secondaryColor).toBe('#1A1A1A');
      expect(result.accentColor).toBe('#D4AF37');
    });

    it('should accept lowercase hex colors', () => {
      const data = {
        ...validBranding,
        primaryColor: '#b8860b',
        secondaryColor: '#1a1a1a',
        accentColor: '#d4af37',
      };
      const result = brandingSchema.parse(data);
      expect(result.primaryColor).toBe('#b8860b');
    });

    it('should reject hex colors without hash', () => {
      const data = { ...validBranding, primaryColor: 'B8860B' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject 3-character hex colors', () => {
      const data = { ...validBranding, primaryColor: '#B86' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject 8-character hex colors (with alpha)', () => {
      const data = { ...validBranding, primaryColor: '#B8860BFF' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject rgb format', () => {
      const data = { ...validBranding, primaryColor: 'rgb(184, 134, 11)' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject color names', () => {
      const data = { ...validBranding, primaryColor: 'gold' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject invalid hex characters', () => {
      const data = { ...validBranding, primaryColor: '#GGGGGG' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });
  });

  describe('Font fields', () => {
    it('should accept all valid heading fonts', () => {
      const headingFonts = [
        'playfair',
        'cormorant',
        'libre-baskerville',
        'lora',
        'merriweather',
        'inter',
      ];

      for (const font of headingFonts) {
        const data = { ...validBranding, headingFont: font };
        const result = brandingSchema.parse(data);
        expect(result.headingFont).toBe(font);
      }
    });

    it('should accept all valid body fonts', () => {
      const bodyFonts = ['inter', 'open-sans', 'roboto', 'lato', 'source-sans'];

      for (const font of bodyFonts) {
        const data = { ...validBranding, bodyFont: font };
        const result = brandingSchema.parse(data);
        expect(result.bodyFont).toBe(font);
      }
    });

    it('should reject invalid heading font', () => {
      const data = { ...validBranding, headingFont: 'arial' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject invalid body font', () => {
      const data = { ...validBranding, bodyFont: 'times-new-roman' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });
  });

  describe('Style fields', () => {
    it('should accept all valid border radius options', () => {
      const options = ['none', 'small', 'medium', 'large', 'full'];

      for (const option of options) {
        const data = { ...validBranding, borderRadius: option };
        const result = brandingSchema.parse(data);
        expect(result.borderRadius).toBe(option);
      }
    });

    it('should accept all valid header styles', () => {
      const options = ['transparent', 'solid', 'gradient'];

      for (const option of options) {
        const data = { ...validBranding, headerStyle: option };
        const result = brandingSchema.parse(data);
        expect(result.headerStyle).toBe(option);
      }
    });

    it('should accept all valid button styles', () => {
      const options = ['solid', 'outline', 'soft'];

      for (const option of options) {
        const data = { ...validBranding, buttonStyle: option };
        const result = brandingSchema.parse(data);
        expect(result.buttonStyle).toBe(option);
      }
    });

    it('should accept all valid card styles', () => {
      const options = ['minimal', 'bordered', 'elevated', 'glass'];

      for (const option of options) {
        const data = { ...validBranding, cardStyle: option };
        const result = brandingSchema.parse(data);
        expect(result.cardStyle).toBe(option);
      }
    });

    it('should accept all valid hero styles', () => {
      const options = ['full', 'split', 'minimal'];

      for (const option of options) {
        const data = { ...validBranding, heroStyle: option };
        const result = brandingSchema.parse(data);
        expect(result.heroStyle).toBe(option);
      }
    });

    it('should reject invalid border radius', () => {
      const data = { ...validBranding, borderRadius: 'extra-large' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject invalid header style', () => {
      const data = { ...validBranding, headerStyle: 'sticky' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject invalid button style', () => {
      const data = { ...validBranding, buttonStyle: 'ghost' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject invalid card style', () => {
      const data = { ...validBranding, cardStyle: 'neumorphic' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject invalid hero style', () => {
      const data = { ...validBranding, heroStyle: 'carousel' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });
  });

  describe('Boolean fields', () => {
    it('should accept true for showFeaturedCategories', () => {
      const data = { ...validBranding, showFeaturedCategories: true };
      const result = brandingSchema.parse(data);
      expect(result.showFeaturedCategories).toBe(true);
    });

    it('should accept false for showFeaturedCategories', () => {
      const data = { ...validBranding, showFeaturedCategories: false };
      const result = brandingSchema.parse(data);
      expect(result.showFeaturedCategories).toBe(false);
    });

    it('should accept true for showTestimonials', () => {
      const data = { ...validBranding, showTestimonials: true };
      const result = brandingSchema.parse(data);
      expect(result.showTestimonials).toBe(true);
    });

    it('should accept false for showTestimonials', () => {
      const data = { ...validBranding, showTestimonials: false };
      const result = brandingSchema.parse(data);
      expect(result.showTestimonials).toBe(false);
    });

    it('should accept true for showNewsletter', () => {
      const data = { ...validBranding, showNewsletter: true };
      const result = brandingSchema.parse(data);
      expect(result.showNewsletter).toBe(true);
    });

    it('should accept false for showNewsletter', () => {
      const data = { ...validBranding, showNewsletter: false };
      const result = brandingSchema.parse(data);
      expect(result.showNewsletter).toBe(false);
    });

    it('should reject string "true" for boolean fields', () => {
      const data = { ...validBranding, showFeaturedCategories: 'true' };
      expect(() => brandingSchema.parse(data)).toThrow();
    });

    it('should reject number 1 for boolean fields', () => {
      const data = { ...validBranding, showTestimonials: 1 };
      expect(() => brandingSchema.parse(data)).toThrow();
    });
  });

  describe('Complete validation', () => {
    it('should validate complete valid branding settings', () => {
      const result = brandingSchema.parse(validBranding);
      expect(result).toEqual(validBranding);
    });

    it('should reject if required field is missing', () => {
      const { primaryColor: _primaryColor, ...incomplete } = validBranding;
      expect(() => brandingSchema.parse(incomplete)).toThrow();
    });

    it('should validate branding with all empty optional URLs', () => {
      const data = {
        ...validBranding,
        logo: '',
        logoDark: '',
        favicon: '',
      };
      const result = brandingSchema.parse(data);
      expect(result.logo).toBe('');
      expect(result.logoDark).toBe('');
      expect(result.favicon).toBe('');
    });

    it('should validate branding with all homepage sections disabled', () => {
      const data = {
        ...validBranding,
        showFeaturedCategories: false,
        showTestimonials: false,
        showNewsletter: false,
      };
      const result = brandingSchema.parse(data);
      expect(result.showFeaturedCategories).toBe(false);
      expect(result.showTestimonials).toBe(false);
      expect(result.showNewsletter).toBe(false);
    });
  });
});
