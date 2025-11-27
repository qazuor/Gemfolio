import { eq } from 'drizzle-orm';

import type { Database } from '../client';
import type {
  BrandingSettings,
  GeneralSettings,
  NotificationSettings,
  SeoSettings,
  ShippingSettings,
  SocialSettings,
} from '../schema/settings';
import { settings } from '../schema/settings';

const defaultSettings: Array<{ key: string; value: unknown; group: string }> = [
  {
    key: 'general',
    group: 'general',
    value: {
      businessName: 'Gemfolio',
      email: 'contacto@gemfolio.com',
      phone: '+54 11 1234-5678',
      address: 'Buenos Aires, Argentina',
      currency: 'ARS',
      timezone: 'America/Argentina/Buenos_Aires',
    } satisfies GeneralSettings,
  },
  {
    key: 'branding',
    group: 'branding',
    value: {
      logo: '',
      logoDark: '',
      favicon: '',
      primaryColor: '#B8860B', // Dark goldenrod
      secondaryColor: '#1A1A1A',
    } satisfies BrandingSettings,
  },
  {
    key: 'shipping',
    group: 'shipping',
    value: {
      flatRate: 2500,
      freeShippingThreshold: 50000,
      shippingInfo:
        'Envíos a todo el país. Tiempo estimado: 3-7 días hábiles. Envío gratis en compras mayores a $50.000.',
    } satisfies ShippingSettings,
  },
  {
    key: 'seo',
    group: 'seo',
    value: {
      siteTitle: 'Gemfolio - Joyería Fina',
      siteDescription:
        'Descubre nuestra colección exclusiva de joyería fina. Anillos, collares, pulseras y más. Diseños únicos con materiales de la más alta calidad.',
      ogImage: '',
      googleAnalyticsId: '',
    } satisfies SeoSettings,
  },
  {
    key: 'social',
    group: 'social',
    value: {
      instagram: '',
      facebook: '',
      whatsapp: '',
      tiktok: '',
    } satisfies SocialSettings,
  },
  {
    key: 'notifications',
    group: 'notifications',
    value: {
      orderEmail: 'pedidos@gemfolio.com',
      notifyNewOrder: true,
      notifyLowStock: true,
      lowStockThreshold: 5,
    } satisfies NotificationSettings,
  },
];

export async function seedSettings(db: Database) {
  console.log('🔧 Seeding settings...');

  for (const setting of defaultSettings) {
    // Check if setting already exists
    const existing = await db.query.settings.findFirst({
      where: eq(settings.key, setting.key),
    });

    if (!existing) {
      await db.insert(settings).values({
        key: setting.key,
        value: setting.value,
        group: setting.group,
      });
      console.log(`  ✓ Created setting: ${setting.key}`);
    } else {
      console.log(`  - Setting already exists: ${setting.key}`);
    }
  }

  console.log('✅ Settings seeded successfully\n');
}
