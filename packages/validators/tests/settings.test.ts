import { describe, expect, it } from 'vitest';
import {
  allSettingsSchema,
  brandingSettingsSchema,
  generalSettingsSchema,
  notificationSettingsSchema,
  seoSettingsSchema,
  shippingSettingsSchema,
  socialSettingsSchema,
  updateSettingsSchema,
} from '../src/settings';

describe('Settings Validators', () => {
  describe('generalSettingsSchema', () => {
    const validSettings = {
      businessName: 'Gemfolio',
      contactEmail: 'contact@gemfolio.com',
    };

    it('should accept valid general settings', () => {
      const result = generalSettingsSchema.parse(validSettings);
      expect(result.businessName).toBe('Gemfolio');
      expect(result.contactEmail).toBe('contact@gemfolio.com');
      expect(result.currency).toBe('ARS');
      expect(result.timezone).toBe('America/Argentina/Buenos_Aires');
    });

    it('should accept settings with all fields', () => {
      const fullSettings = {
        ...validSettings,
        contactPhone: '+54 11 1234-5678',
        address: 'Av. Corrientes 1234, Buenos Aires',
        currency: 'USD',
        timezone: 'America/New_York',
      };
      const result = generalSettingsSchema.parse(fullSettings);
      expect(result.contactPhone).toBe('+54 11 1234-5678');
      expect(result.address).toBe('Av. Corrientes 1234, Buenos Aires');
      expect(result.currency).toBe('USD');
    });

    it('should reject empty business name', () => {
      expect(() => generalSettingsSchema.parse({ ...validSettings, businessName: '' })).toThrow();
    });

    it('should reject business name exceeding max length', () => {
      const longName = 'a'.repeat(256);
      expect(() =>
        generalSettingsSchema.parse({ ...validSettings, businessName: longName })
      ).toThrow();
    });

    it('should reject invalid email', () => {
      expect(() =>
        generalSettingsSchema.parse({ ...validSettings, contactEmail: 'invalid' })
      ).toThrow();
    });

    it('should reject invalid currency', () => {
      expect(() => generalSettingsSchema.parse({ ...validSettings, currency: 'EUR' })).toThrow();
    });

    it('should reject phone exceeding max length', () => {
      const longPhone = '1'.repeat(51);
      expect(() =>
        generalSettingsSchema.parse({ ...validSettings, contactPhone: longPhone })
      ).toThrow();
    });

    it('should reject address exceeding max length', () => {
      const longAddress = 'a'.repeat(501);
      expect(() =>
        generalSettingsSchema.parse({ ...validSettings, address: longAddress })
      ).toThrow();
    });
  });

  describe('brandingSettingsSchema', () => {
    it('should accept valid branding settings', () => {
      const result = brandingSettingsSchema.parse({
        logo: 'https://example.com/logo.png',
        primaryColor: '#C7A652',
      });
      expect(result.logo).toBe('https://example.com/logo.png');
      expect(result.primaryColor).toBe('#C7A652');
    });

    it('should accept empty branding settings', () => {
      const result = brandingSettingsSchema.parse({});
      expect(result).toEqual({});
    });

    it('should accept settings with all fields', () => {
      const fullSettings = {
        logo: 'https://example.com/logo.png',
        logoDark: 'https://example.com/logo-dark.png',
        favicon: 'https://example.com/favicon.ico',
        primaryColor: '#C7A652',
        secondaryColor: '#333333',
      };
      const result = brandingSettingsSchema.parse(fullSettings);
      expect(result.logoDark).toBe('https://example.com/logo-dark.png');
      expect(result.favicon).toBe('https://example.com/favicon.ico');
    });

    it('should accept null logo', () => {
      const result = brandingSettingsSchema.parse({ logo: null });
      expect(result.logo).toBeNull();
    });

    it('should reject invalid logo URL', () => {
      expect(() => brandingSettingsSchema.parse({ logo: 'not-a-url' })).toThrow();
    });

    it('should reject invalid hex color', () => {
      expect(() => brandingSettingsSchema.parse({ primaryColor: 'red' })).toThrow();
      expect(() => brandingSettingsSchema.parse({ primaryColor: '#GGG' })).toThrow();
    });

    it('should accept 3-character hex color', () => {
      const result = brandingSettingsSchema.parse({ primaryColor: '#FFF' });
      expect(result.primaryColor).toBe('#FFF');
    });

    it('should accept 6-character hex color', () => {
      const result = brandingSettingsSchema.parse({ primaryColor: '#FFFFFF' });
      expect(result.primaryColor).toBe('#FFFFFF');
    });
  });

  describe('shippingSettingsSchema', () => {
    it('should accept valid shipping settings', () => {
      const result = shippingSettingsSchema.parse({
        flatRate: '500.00',
        freeShippingThreshold: '5000.00',
      });
      expect(result.flatRate).toBe('500.00');
      expect(result.freeShippingThreshold).toBe('5000.00');
    });

    it('should accept empty shipping settings', () => {
      const result = shippingSettingsSchema.parse({});
      expect(result).toEqual({});
    });

    it('should accept settings with shipping info', () => {
      const result = shippingSettingsSchema.parse({
        shippingInfo: 'Envíos a todo el país en 3-5 días hábiles',
      });
      expect(result.shippingInfo).toBe('Envíos a todo el país en 3-5 días hábiles');
    });

    it('should accept null freeShippingThreshold', () => {
      const result = shippingSettingsSchema.parse({ freeShippingThreshold: null });
      expect(result.freeShippingThreshold).toBeNull();
    });

    it('should reject invalid flatRate format', () => {
      expect(() => shippingSettingsSchema.parse({ flatRate: 'invalid' })).toThrow();
    });

    it('should reject invalid freeShippingThreshold format', () => {
      expect(() => shippingSettingsSchema.parse({ freeShippingThreshold: 'invalid' })).toThrow();
    });

    it('should reject shippingInfo exceeding max length', () => {
      const longInfo = 'a'.repeat(2001);
      expect(() => shippingSettingsSchema.parse({ shippingInfo: longInfo })).toThrow();
    });
  });

  describe('notificationSettingsSchema', () => {
    it('should apply defaults', () => {
      const result = notificationSettingsSchema.parse({});
      expect(result.notifyNewOrder).toBe(true);
      expect(result.notifyLowStock).toBe(true);
      expect(result.lowStockThreshold).toBe(5);
    });

    it('should accept valid notification settings', () => {
      const settings = {
        orderNotificationEmail: 'orders@gemfolio.com',
        notifyNewOrder: false,
        notifyLowStock: false,
        lowStockThreshold: 10,
      };
      const result = notificationSettingsSchema.parse(settings);
      expect(result.orderNotificationEmail).toBe('orders@gemfolio.com');
      expect(result.notifyNewOrder).toBe(false);
      expect(result.lowStockThreshold).toBe(10);
    });

    it('should reject invalid email', () => {
      expect(() =>
        notificationSettingsSchema.parse({ orderNotificationEmail: 'invalid' })
      ).toThrow();
    });

    it('should reject negative lowStockThreshold', () => {
      expect(() => notificationSettingsSchema.parse({ lowStockThreshold: -1 })).toThrow();
    });
  });

  describe('seoSettingsSchema', () => {
    it('should accept valid SEO settings', () => {
      const result = seoSettingsSchema.parse({
        defaultTitle: 'Gemfolio - Joyería Artesanal',
        defaultDescription: 'Descubre nuestra colección de joyería artesanal',
        ogImage: 'https://example.com/og-image.jpg',
        googleAnalyticsId: 'G-XXXXXXXXXX',
      });
      expect(result.defaultTitle).toBe('Gemfolio - Joyería Artesanal');
    });

    it('should accept empty SEO settings', () => {
      const result = seoSettingsSchema.parse({});
      expect(result).toEqual({});
    });

    it('should accept null ogImage', () => {
      const result = seoSettingsSchema.parse({ ogImage: null });
      expect(result.ogImage).toBeNull();
    });

    it('should reject defaultTitle exceeding max length', () => {
      const longTitle = 'a'.repeat(71);
      expect(() => seoSettingsSchema.parse({ defaultTitle: longTitle })).toThrow();
    });

    it('should reject defaultDescription exceeding max length', () => {
      const longDesc = 'a'.repeat(161);
      expect(() => seoSettingsSchema.parse({ defaultDescription: longDesc })).toThrow();
    });

    it('should reject invalid ogImage URL', () => {
      expect(() => seoSettingsSchema.parse({ ogImage: 'not-a-url' })).toThrow();
    });

    it('should reject googleAnalyticsId exceeding max length', () => {
      const longId = `G-${'X'.repeat(50)}`;
      expect(() => seoSettingsSchema.parse({ googleAnalyticsId: longId })).toThrow();
    });
  });

  describe('socialSettingsSchema', () => {
    it('should accept valid social settings', () => {
      const result = socialSettingsSchema.parse({
        instagram: 'https://instagram.com/gemfolio',
        facebook: 'https://facebook.com/gemfolio',
        whatsapp: '+5491112345678',
        tiktok: 'https://tiktok.com/@gemfolio',
        twitter: 'https://twitter.com/gemfolio',
      });
      expect(result.instagram).toBe('https://instagram.com/gemfolio');
      expect(result.whatsapp).toBe('+5491112345678');
    });

    it('should accept empty social settings', () => {
      const result = socialSettingsSchema.parse({});
      expect(result).toEqual({});
    });

    it('should accept null social URLs', () => {
      const result = socialSettingsSchema.parse({
        instagram: null,
        facebook: null,
        tiktok: null,
        twitter: null,
      });
      expect(result.instagram).toBeNull();
    });

    it('should reject invalid social URLs', () => {
      expect(() => socialSettingsSchema.parse({ instagram: 'not-a-url' })).toThrow();
    });

    it('should reject whatsapp exceeding max length', () => {
      const longWhatsapp = '1'.repeat(21);
      expect(() => socialSettingsSchema.parse({ whatsapp: longWhatsapp })).toThrow();
    });
  });

  describe('allSettingsSchema', () => {
    it('should accept complete settings', () => {
      const settings = {
        general: {
          businessName: 'Gemfolio',
          contactEmail: 'contact@gemfolio.com',
        },
        branding: {
          primaryColor: '#C7A652',
        },
        shipping: {
          flatRate: '500.00',
        },
        notifications: {
          notifyNewOrder: true,
        },
        seo: {
          defaultTitle: 'Gemfolio',
        },
        social: {
          instagram: 'https://instagram.com/gemfolio',
        },
      };
      const result = allSettingsSchema.parse(settings);
      expect(result.general?.businessName).toBe('Gemfolio');
      expect(result.branding?.primaryColor).toBe('#C7A652');
    });

    it('should accept empty settings', () => {
      const result = allSettingsSchema.parse({});
      expect(result).toEqual({});
    });

    it('should accept partial settings', () => {
      const result = allSettingsSchema.parse({
        general: {
          businessName: 'Gemfolio',
          contactEmail: 'contact@gemfolio.com',
        },
      });
      expect(result.general?.businessName).toBe('Gemfolio');
      expect(result.branding).toBeUndefined();
    });
  });

  describe('updateSettingsSchema', () => {
    it('should accept valid settings update', () => {
      const result = updateSettingsSchema.parse({
        key: 'businessName',
        value: 'New Name',
        group: 'general',
      });
      expect(result.key).toBe('businessName');
      expect(result.value).toBe('New Name');
      expect(result.group).toBe('general');
    });

    it('should accept update without group', () => {
      const result = updateSettingsSchema.parse({
        key: 'primaryColor',
        value: '#FF0000',
      });
      expect(result.key).toBe('primaryColor');
      expect(result.group).toBeUndefined();
    });

    it('should accept any value type', () => {
      const resultString = updateSettingsSchema.parse({ key: 'test', value: 'string' });
      expect(resultString.value).toBe('string');

      const resultNumber = updateSettingsSchema.parse({ key: 'test', value: 123 });
      expect(resultNumber.value).toBe(123);

      const resultBoolean = updateSettingsSchema.parse({ key: 'test', value: true });
      expect(resultBoolean.value).toBe(true);

      const resultObject = updateSettingsSchema.parse({ key: 'test', value: { nested: 'value' } });
      expect(resultObject.value).toEqual({ nested: 'value' });
    });

    it('should reject empty key', () => {
      expect(() => updateSettingsSchema.parse({ key: '', value: 'test' })).toThrow();
    });
  });
});
