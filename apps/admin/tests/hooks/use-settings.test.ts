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

    it('should have gold-themed default colors', () => {
      // Primary should be a gold/brown color
      expect(defaultBrandingSettings.primaryColor).toBe('#B8860B');
      // Secondary should be dark
      expect(defaultBrandingSettings.secondaryColor).toBe('#1A1A1A');
      // Accent should be gold
      expect(defaultBrandingSettings.accentColor).toBe('#D4AF37');
    });

    it('should have playfair as default heading font', () => {
      expect(defaultBrandingSettings.headingFont).toBe('playfair');
    });

    it('should have inter as default body font', () => {
      expect(defaultBrandingSettings.bodyFont).toBe('inter');
    });

    it('should have medium as default border radius', () => {
      expect(defaultBrandingSettings.borderRadius).toBe('medium');
    });

    it('should have homepage sections enabled by default', () => {
      expect(defaultBrandingSettings.showFeaturedCategories).toBe(true);
      expect(defaultBrandingSettings.showTestimonials).toBe(true);
      expect(defaultBrandingSettings.showNewsletter).toBe(true);
    });
  });

  describe('defaultGeneralSettings', () => {
    it('should have all required fields', () => {
      expect(defaultGeneralSettings).toHaveProperty('businessName');
      expect(defaultGeneralSettings).toHaveProperty('email');
      expect(defaultGeneralSettings).toHaveProperty('phone');
      expect(defaultGeneralSettings).toHaveProperty('address');
      expect(defaultGeneralSettings).toHaveProperty('currency');
      expect(defaultGeneralSettings).toHaveProperty('timezone');
    });

    it('should have ARS as default currency', () => {
      expect(defaultGeneralSettings.currency).toBe('ARS');
    });

    it('should have Argentina timezone as default', () => {
      expect(defaultGeneralSettings.timezone).toBe('America/Argentina/Buenos_Aires');
    });
  });

  describe('defaultShippingSettings', () => {
    it('should have all required fields', () => {
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
    it('should have all required fields', () => {
      expect(defaultSeoSettings).toHaveProperty('siteTitle');
      expect(defaultSeoSettings).toHaveProperty('siteDescription');
      expect(defaultSeoSettings).toHaveProperty('ogImage');
    });
  });

  describe('defaultSocialSettings', () => {
    it('should have social media fields', () => {
      expect(defaultSocialSettings).toHaveProperty('instagram');
      expect(defaultSocialSettings).toHaveProperty('facebook');
      expect(defaultSocialSettings).toHaveProperty('whatsapp');
      expect(defaultSocialSettings).toHaveProperty('tiktok');
    });
  });

  describe('defaultNotificationSettings', () => {
    it('should have all required fields', () => {
      expect(defaultNotificationSettings).toHaveProperty('orderEmail');
      expect(defaultNotificationSettings).toHaveProperty('notifyNewOrder');
      expect(defaultNotificationSettings).toHaveProperty('notifyLowStock');
      expect(defaultNotificationSettings).toHaveProperty('lowStockThreshold');
    });

    it('should have notifications enabled by default', () => {
      expect(defaultNotificationSettings.notifyNewOrder).toBe(true);
      expect(defaultNotificationSettings.notifyLowStock).toBe(true);
    });
  });

  describe('headingFontOptions', () => {
    it('should have 6 font options', () => {
      expect(headingFontOptions).toHaveLength(6);
    });

    it('should have value and label for each option', () => {
      for (const option of headingFontOptions) {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      }
    });

    it('should include playfair option', () => {
      const playfair = headingFontOptions.find((o) => o.value === 'playfair');
      expect(playfair).toBeDefined();
      expect(playfair?.label).toContain('Playfair');
    });

    it('should include all expected fonts', () => {
      const values = headingFontOptions.map((o) => o.value);
      expect(values).toContain('playfair');
      expect(values).toContain('cormorant');
      expect(values).toContain('libre-baskerville');
      expect(values).toContain('lora');
      expect(values).toContain('merriweather');
      expect(values).toContain('inter');
    });
  });

  describe('bodyFontOptions', () => {
    it('should have 5 font options', () => {
      expect(bodyFontOptions).toHaveLength(5);
    });

    it('should have value and label for each option', () => {
      for (const option of bodyFontOptions) {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
      }
    });

    it('should include all expected fonts', () => {
      const values = bodyFontOptions.map((o) => o.value);
      expect(values).toContain('inter');
      expect(values).toContain('open-sans');
      expect(values).toContain('roboto');
      expect(values).toContain('lato');
      expect(values).toContain('source-sans');
    });
  });

  describe('borderRadiusOptions', () => {
    it('should have 5 options', () => {
      expect(borderRadiusOptions).toHaveLength(5);
    });

    it('should include all expected options', () => {
      const values = borderRadiusOptions.map((o) => o.value);
      expect(values).toContain('none');
      expect(values).toContain('small');
      expect(values).toContain('medium');
      expect(values).toContain('large');
      expect(values).toContain('full');
    });

    it('should have descriptive labels with pixel values', () => {
      const none = borderRadiusOptions.find((o) => o.value === 'none');
      expect(none?.label).toContain('0px');

      const small = borderRadiusOptions.find((o) => o.value === 'small');
      expect(small?.label).toContain('4px');

      const medium = borderRadiusOptions.find((o) => o.value === 'medium');
      expect(medium?.label).toContain('8px');

      const large = borderRadiusOptions.find((o) => o.value === 'large');
      expect(large?.label).toContain('16px');
    });
  });

  describe('headerStyleOptions', () => {
    it('should have 3 options', () => {
      expect(headerStyleOptions).toHaveLength(3);
    });

    it('should include all expected options', () => {
      const values = headerStyleOptions.map((o) => o.value);
      expect(values).toContain('solid');
      expect(values).toContain('transparent');
      expect(values).toContain('gradient');
    });
  });

  describe('buttonStyleOptions', () => {
    it('should have 3 options', () => {
      expect(buttonStyleOptions).toHaveLength(3);
    });

    it('should include all expected options', () => {
      const values = buttonStyleOptions.map((o) => o.value);
      expect(values).toContain('solid');
      expect(values).toContain('outline');
      expect(values).toContain('soft');
    });
  });

  describe('cardStyleOptions', () => {
    it('should have 4 options', () => {
      expect(cardStyleOptions).toHaveLength(4);
    });

    it('should include all expected options', () => {
      const values = cardStyleOptions.map((o) => o.value);
      expect(values).toContain('minimal');
      expect(values).toContain('bordered');
      expect(values).toContain('elevated');
      expect(values).toContain('glass');
    });
  });

  describe('heroStyleOptions', () => {
    it('should have 3 options', () => {
      expect(heroStyleOptions).toHaveLength(3);
    });

    it('should include all expected options', () => {
      const values = heroStyleOptions.map((o) => o.value);
      expect(values).toContain('full');
      expect(values).toContain('split');
      expect(values).toContain('minimal');
    });
  });

  describe('timezoneOptions', () => {
    it('should have at least 2 options', () => {
      expect(timezoneOptions.length).toBeGreaterThanOrEqual(2);
    });

    it('should include Buenos Aires timezone', () => {
      const buenosAires = timezoneOptions.find((o) => o.value.includes('Buenos_Aires'));
      expect(buenosAires).toBeDefined();
    });

    it('should include UTC', () => {
      const utc = timezoneOptions.find((o) => o.value === 'UTC');
      expect(utc).toBeDefined();
    });
  });

  describe('currencyOptions', () => {
    it('should have 2 options', () => {
      expect(currencyOptions).toHaveLength(2);
    });

    it('should include ARS', () => {
      const ars = currencyOptions.find((o) => o.value === 'ARS');
      expect(ars).toBeDefined();
      expect(ars?.label).toContain('Peso');
    });

    it('should include USD', () => {
      const usd = currencyOptions.find((o) => o.value === 'USD');
      expect(usd).toBeDefined();
      expect(usd?.label).toContain('Dólar');
    });
  });
});
