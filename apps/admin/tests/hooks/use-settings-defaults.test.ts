import { describe, expect, it } from 'vitest';
import {
  bodyFontOptions,
  borderRadiusOptions,
  buttonStyleOptions,
  cardStyleOptions,
  currencyOptions,
  defaultBrandingSettings,
  defaultGeneralSettings,
  defaultNotificationSettings,
  defaultSeoSettings,
  defaultShippingSettings,
  defaultSocialSettings,
  headerStyleOptions,
  headingFontOptions,
  heroStyleOptions,
  timezoneOptions,
} from '../../src/hooks/use-settings';

describe('Settings Defaults and Options', () => {
  describe('defaultGeneralSettings', () => {
    it('should have all required properties', () => {
      expect(defaultGeneralSettings).toHaveProperty('businessName');
      expect(defaultGeneralSettings).toHaveProperty('email');
      expect(defaultGeneralSettings).toHaveProperty('phone');
      expect(defaultGeneralSettings).toHaveProperty('address');
      expect(defaultGeneralSettings).toHaveProperty('currency');
      expect(defaultGeneralSettings).toHaveProperty('timezone');
    });

    it('should have valid currency value', () => {
      expect(['ARS', 'USD']).toContain(defaultGeneralSettings.currency);
    });

    it('should have valid timezone value', () => {
      expect(defaultGeneralSettings.timezone).toBe('America/Argentina/Buenos_Aires');
    });
  });

  describe('defaultBrandingSettings', () => {
    it('should have all required properties', () => {
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

    it('should have valid color format', () => {
      expect(defaultBrandingSettings.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(defaultBrandingSettings.secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(defaultBrandingSettings.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should have valid font values', () => {
      const validHeadingFonts = [
        'playfair',
        'cormorant',
        'libre-baskerville',
        'lora',
        'merriweather',
        'inter',
      ];
      const validBodyFonts = ['inter', 'open-sans', 'roboto', 'lato', 'source-sans'];

      expect(validHeadingFonts).toContain(defaultBrandingSettings.headingFont);
      expect(validBodyFonts).toContain(defaultBrandingSettings.bodyFont);
    });

    it('should have boolean values for toggles', () => {
      expect(typeof defaultBrandingSettings.showFeaturedCategories).toBe('boolean');
      expect(typeof defaultBrandingSettings.showTestimonials).toBe('boolean');
      expect(typeof defaultBrandingSettings.showNewsletter).toBe('boolean');
    });
  });

  describe('defaultShippingSettings', () => {
    it('should have all required properties', () => {
      expect(defaultShippingSettings).toHaveProperty('flatRate');
      expect(defaultShippingSettings).toHaveProperty('freeShippingThreshold');
      expect(defaultShippingSettings).toHaveProperty('shippingInfo');
    });

    it('should have numeric values for rates', () => {
      expect(typeof defaultShippingSettings.flatRate).toBe('number');
      expect(typeof defaultShippingSettings.freeShippingThreshold).toBe('number');
    });
  });

  describe('defaultSeoSettings', () => {
    it('should have all required properties', () => {
      expect(defaultSeoSettings).toHaveProperty('siteTitle');
      expect(defaultSeoSettings).toHaveProperty('siteDescription');
      expect(defaultSeoSettings).toHaveProperty('ogImage');
      expect(defaultSeoSettings).toHaveProperty('googleAnalyticsId');
    });
  });

  describe('defaultSocialSettings', () => {
    it('should have all required properties', () => {
      expect(defaultSocialSettings).toHaveProperty('instagram');
      expect(defaultSocialSettings).toHaveProperty('facebook');
      expect(defaultSocialSettings).toHaveProperty('whatsapp');
      expect(defaultSocialSettings).toHaveProperty('tiktok');
    });
  });

  describe('defaultNotificationSettings', () => {
    it('should have all required properties', () => {
      expect(defaultNotificationSettings).toHaveProperty('orderEmail');
      expect(defaultNotificationSettings).toHaveProperty('notifyNewOrder');
      expect(defaultNotificationSettings).toHaveProperty('notifyLowStock');
      expect(defaultNotificationSettings).toHaveProperty('lowStockThreshold');
    });

    it('should have boolean values for notifications', () => {
      expect(typeof defaultNotificationSettings.notifyNewOrder).toBe('boolean');
      expect(typeof defaultNotificationSettings.notifyLowStock).toBe('boolean');
    });

    it('should have numeric threshold', () => {
      expect(typeof defaultNotificationSettings.lowStockThreshold).toBe('number');
    });
  });

  describe('font options', () => {
    describe('headingFontOptions', () => {
      it('should have valid options array', () => {
        expect(Array.isArray(headingFontOptions)).toBe(true);
        expect(headingFontOptions.length).toBeGreaterThan(0);
      });

      it('should have value and label for each option', () => {
        headingFontOptions.forEach((option) => {
          expect(option).toHaveProperty('value');
          expect(option).toHaveProperty('label');
          expect(typeof option.value).toBe('string');
          expect(typeof option.label).toBe('string');
        });
      });

      it('should contain expected fonts', () => {
        const values = headingFontOptions.map((o) => o.value);
        expect(values).toContain('playfair');
        expect(values).toContain('cormorant');
        expect(values).toContain('lora');
      });
    });

    describe('bodyFontOptions', () => {
      it('should have valid options array', () => {
        expect(Array.isArray(bodyFontOptions)).toBe(true);
        expect(bodyFontOptions.length).toBeGreaterThan(0);
      });

      it('should have value and label for each option', () => {
        bodyFontOptions.forEach((option) => {
          expect(option).toHaveProperty('value');
          expect(option).toHaveProperty('label');
        });
      });

      it('should contain expected fonts', () => {
        const values = bodyFontOptions.map((o) => o.value);
        expect(values).toContain('inter');
        expect(values).toContain('roboto');
        expect(values).toContain('lato');
      });
    });
  });

  describe('style options', () => {
    describe('borderRadiusOptions', () => {
      it('should have valid options', () => {
        expect(Array.isArray(borderRadiusOptions)).toBe(true);
        const values = borderRadiusOptions.map((o) => o.value);
        expect(values).toContain('none');
        expect(values).toContain('small');
        expect(values).toContain('medium');
        expect(values).toContain('large');
        expect(values).toContain('full');
      });
    });

    describe('headerStyleOptions', () => {
      it('should have valid options', () => {
        expect(Array.isArray(headerStyleOptions)).toBe(true);
        const values = headerStyleOptions.map((o) => o.value);
        expect(values).toContain('solid');
        expect(values).toContain('transparent');
        expect(values).toContain('gradient');
      });
    });

    describe('buttonStyleOptions', () => {
      it('should have valid options', () => {
        expect(Array.isArray(buttonStyleOptions)).toBe(true);
        const values = buttonStyleOptions.map((o) => o.value);
        expect(values).toContain('solid');
        expect(values).toContain('outline');
        expect(values).toContain('soft');
      });
    });

    describe('cardStyleOptions', () => {
      it('should have valid options', () => {
        expect(Array.isArray(cardStyleOptions)).toBe(true);
        const values = cardStyleOptions.map((o) => o.value);
        expect(values).toContain('minimal');
        expect(values).toContain('bordered');
        expect(values).toContain('elevated');
        expect(values).toContain('glass');
      });
    });

    describe('heroStyleOptions', () => {
      it('should have valid options', () => {
        expect(Array.isArray(heroStyleOptions)).toBe(true);
        const values = heroStyleOptions.map((o) => o.value);
        expect(values).toContain('full');
        expect(values).toContain('split');
        expect(values).toContain('minimal');
      });
    });
  });

  describe('locale options', () => {
    describe('timezoneOptions', () => {
      it('should have valid options', () => {
        expect(Array.isArray(timezoneOptions)).toBe(true);
        expect(timezoneOptions.length).toBeGreaterThan(0);
      });

      it('should contain Buenos Aires timezone', () => {
        const values = timezoneOptions.map((o) => o.value);
        expect(values).toContain('America/Argentina/Buenos_Aires');
      });

      it('should contain UTC', () => {
        const values = timezoneOptions.map((o) => o.value);
        expect(values).toContain('UTC');
      });
    });

    describe('currencyOptions', () => {
      it('should have valid options', () => {
        expect(Array.isArray(currencyOptions)).toBe(true);
        expect(currencyOptions.length).toBeGreaterThan(0);
      });

      it('should contain ARS and USD', () => {
        const values = currencyOptions.map((o) => o.value);
        expect(values).toContain('ARS');
        expect(values).toContain('USD');
      });
    });
  });
});
