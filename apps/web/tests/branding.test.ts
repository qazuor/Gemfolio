import { describe, expect, it } from 'vitest';
import {
  type BrandingSettings,
  defaultBrandingSettings,
  generateCssVariables,
  getFontFamilyCss,
  getGoogleFontsUrl,
} from '../src/lib/api';

describe('Branding Settings Helpers', () => {
  describe('generateCssVariables', () => {
    it('should generate CSS variables from branding settings', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: '#B8860B',
        secondaryColor: '#1A1A1A',
        accentColor: '#D4AF37',
        borderRadius: 'medium',
      };

      const css = generateCssVariables(branding);

      expect(css).toContain('--primary:');
      expect(css).toContain('--secondary:');
      expect(css).toContain('--accent:');
      expect(css).toContain('--radius: 0.5rem');
    });

    it('should convert hex colors to HSL format', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: '#FF0000', // Pure red
        secondaryColor: '#00FF00', // Pure green
        accentColor: '#0000FF', // Pure blue
      };

      const css = generateCssVariables(branding);

      // Red should be approximately 0 100% 50%
      expect(css).toContain('--primary: 0 100% 50%');
      // Green should be approximately 120 100% 50%
      expect(css).toContain('--secondary: 120 100% 50%');
      // Blue should be approximately 240 100% 50%
      expect(css).toContain('--accent: 240 100% 50%');
    });

    it('should handle white color', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: '#FFFFFF',
      };

      const css = generateCssVariables(branding);

      // White should be 0 0% 100%
      expect(css).toContain('--primary: 0 0% 100%');
    });

    it('should handle black color', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: '#000000',
      };

      const css = generateCssVariables(branding);

      // Black should be 0 0% 0%
      expect(css).toContain('--primary: 0 0% 0%');
    });

    it('should set correct border radius for each option', () => {
      const radiusOptions: Array<{ value: BrandingSettings['borderRadius']; expected: string }> = [
        { value: 'none', expected: '0px' },
        { value: 'small', expected: '0.25rem' },
        { value: 'medium', expected: '0.5rem' },
        { value: 'large', expected: '1rem' },
        { value: 'full', expected: '9999px' },
      ];

      for (const option of radiusOptions) {
        const branding: BrandingSettings = {
          ...defaultBrandingSettings,
          borderRadius: option.value,
        };

        const css = generateCssVariables(branding);
        expect(css).toContain(`--radius: ${option.expected}`);
      }
    });

    it('should handle lowercase hex colors', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: '#ff5500',
      };

      const css = generateCssVariables(branding);

      expect(css).toContain('--primary:');
    });

    it('should handle invalid hex color gracefully', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        primaryColor: 'invalid',
      };

      const css = generateCssVariables(branding);

      // Should return fallback value
      expect(css).toContain('--primary: 0 0% 0%');
    });
  });

  describe('getGoogleFontsUrl', () => {
    it('should generate Google Fonts URL for default fonts', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        headingFont: 'playfair',
        bodyFont: 'inter',
      };

      const url = getGoogleFontsUrl(branding);

      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('Playfair+Display');
      expect(url).toContain('Inter');
    });

    it('should include all heading font options', () => {
      const headingFonts: BrandingSettings['headingFont'][] = [
        'playfair',
        'cormorant',
        'libre-baskerville',
        'lora',
        'merriweather',
        'inter',
      ];

      for (const font of headingFonts) {
        const branding: BrandingSettings = {
          ...defaultBrandingSettings,
          headingFont: font,
        };

        const url = getGoogleFontsUrl(branding);
        expect(url).toContain('fonts.googleapis.com');
      }
    });

    it('should include all body font options', () => {
      const bodyFonts: BrandingSettings['bodyFont'][] = [
        'inter',
        'open-sans',
        'roboto',
        'lato',
        'source-sans',
      ];

      for (const font of bodyFonts) {
        const branding: BrandingSettings = {
          ...defaultBrandingSettings,
          bodyFont: font,
        };

        const url = getGoogleFontsUrl(branding);
        expect(url).toContain('fonts.googleapis.com');
      }
    });

    it('should not duplicate fonts when heading and body are the same', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        headingFont: 'inter',
        bodyFont: 'inter',
      };

      const url = getGoogleFontsUrl(branding);

      // Count occurrences of Inter
      const matches = url.match(/Inter/g);
      expect(matches?.length).toBe(1);
    });

    it('should generate correct URL for Cormorant font', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        headingFont: 'cormorant',
      };

      const url = getGoogleFontsUrl(branding);
      expect(url).toContain('Cormorant+Garamond');
    });

    it('should generate correct URL for Source Sans font', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        bodyFont: 'source-sans',
      };

      const url = getGoogleFontsUrl(branding);
      expect(url).toContain('Source+Sans+3');
    });
  });

  describe('getFontFamilyCss', () => {
    it('should return correct font families for default settings', () => {
      const branding: BrandingSettings = {
        ...defaultBrandingSettings,
        headingFont: 'playfair',
        bodyFont: 'inter',
      };

      const fonts = getFontFamilyCss(branding);

      expect(fonts.heading).toBe('"Playfair Display", serif');
      expect(fonts.body).toBe('"Inter", sans-serif');
    });

    it('should return serif fonts for elegant heading options', () => {
      const serifFonts: BrandingSettings['headingFont'][] = [
        'playfair',
        'cormorant',
        'libre-baskerville',
        'lora',
        'merriweather',
      ];

      for (const font of serifFonts) {
        const branding: BrandingSettings = {
          ...defaultBrandingSettings,
          headingFont: font,
        };

        const fonts = getFontFamilyCss(branding);
        expect(fonts.heading).toContain('serif');
      }
    });

    it('should return sans-serif fonts for body options', () => {
      const sansSerifFonts: BrandingSettings['bodyFont'][] = [
        'inter',
        'open-sans',
        'roboto',
        'lato',
        'source-sans',
      ];

      for (const font of sansSerifFonts) {
        const branding: BrandingSettings = {
          ...defaultBrandingSettings,
          bodyFont: font,
        };

        const fonts = getFontFamilyCss(branding);
        expect(fonts.body).toContain('sans-serif');
      }
    });

    it('should return correct font family for each heading option', () => {
      const expectedFonts: Record<BrandingSettings['headingFont'], string> = {
        playfair: '"Playfair Display", serif',
        cormorant: '"Cormorant Garamond", serif',
        'libre-baskerville': '"Libre Baskerville", serif',
        lora: '"Lora", serif',
        merriweather: '"Merriweather", serif',
        inter: '"Inter", sans-serif',
      };

      for (const [font, expected] of Object.entries(expectedFonts)) {
        const branding: BrandingSettings = {
          ...defaultBrandingSettings,
          headingFont: font as BrandingSettings['headingFont'],
        };

        const fonts = getFontFamilyCss(branding);
        expect(fonts.heading).toBe(expected);
      }
    });

    it('should return correct font family for each body option', () => {
      const expectedFonts: Record<BrandingSettings['bodyFont'], string> = {
        inter: '"Inter", sans-serif',
        'open-sans': '"Open Sans", sans-serif',
        roboto: '"Roboto", sans-serif',
        lato: '"Lato", sans-serif',
        'source-sans': '"Source Sans 3", sans-serif',
      };

      for (const [font, expected] of Object.entries(expectedFonts)) {
        const branding: BrandingSettings = {
          ...defaultBrandingSettings,
          bodyFont: font as BrandingSettings['bodyFont'],
        };

        const fonts = getFontFamilyCss(branding);
        expect(fonts.body).toBe(expected);
      }
    });
  });

  describe('defaultBrandingSettings', () => {
    it('should have all required fields', () => {
      expect(defaultBrandingSettings).toHaveProperty('logo');
      expect(defaultBrandingSettings).toHaveProperty('logoDark');
      expect(defaultBrandingSettings).toHaveProperty('favicon');
      expect(defaultBrandingSettings).toHaveProperty('primaryColor');
      expect(defaultBrandingSettings).toHaveProperty('secondaryColor');
      expect(defaultBrandingSettings).toHaveProperty('accentColor');
      expect(defaultBrandingSettings).toHaveProperty('headingFont');
      expect(defaultBrandingSettings).toHaveProperty('bodyFont');
      expect(defaultBrandingSettings).toHaveProperty('borderRadius');
      expect(defaultBrandingSettings).toHaveProperty('headerStyle');
      expect(defaultBrandingSettings).toHaveProperty('buttonStyle');
      expect(defaultBrandingSettings).toHaveProperty('cardStyle');
      expect(defaultBrandingSettings).toHaveProperty('heroStyle');
      expect(defaultBrandingSettings).toHaveProperty('showFeaturedCategories');
      expect(defaultBrandingSettings).toHaveProperty('showTestimonials');
      expect(defaultBrandingSettings).toHaveProperty('showNewsletter');
    });

    it('should have valid default color values', () => {
      expect(defaultBrandingSettings.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(defaultBrandingSettings.secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(defaultBrandingSettings.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should have valid default enum values', () => {
      expect([
        'playfair',
        'cormorant',
        'libre-baskerville',
        'lora',
        'merriweather',
        'inter',
      ]).toContain(defaultBrandingSettings.headingFont);
      expect(['inter', 'open-sans', 'roboto', 'lato', 'source-sans']).toContain(
        defaultBrandingSettings.bodyFont
      );
      expect(['none', 'small', 'medium', 'large', 'full']).toContain(
        defaultBrandingSettings.borderRadius
      );
      expect(['transparent', 'solid', 'gradient']).toContain(defaultBrandingSettings.headerStyle);
      expect(['solid', 'outline', 'soft']).toContain(defaultBrandingSettings.buttonStyle);
      expect(['minimal', 'bordered', 'elevated', 'glass']).toContain(
        defaultBrandingSettings.cardStyle
      );
      expect(['full', 'split', 'minimal']).toContain(defaultBrandingSettings.heroStyle);
    });

    it('should have boolean values for homepage flags', () => {
      expect(typeof defaultBrandingSettings.showFeaturedCategories).toBe('boolean');
      expect(typeof defaultBrandingSettings.showTestimonials).toBe('boolean');
      expect(typeof defaultBrandingSettings.showNewsletter).toBe('boolean');
    });
  });
});
