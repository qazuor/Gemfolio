import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

// Settings table (key-value store with groups)
export const settings = pgTable('settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
  group: varchar('group', { length: 50 }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Settings type definitions
export type GeneralSettings = {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  currency: 'ARS' | 'USD';
  timezone: string;
};

export type BrandingSettings = {
  logo: string;
  logoDark: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Typography
  headingFont: 'playfair' | 'cormorant' | 'libre-baskerville' | 'lora' | 'merriweather' | 'inter';
  bodyFont: 'inter' | 'open-sans' | 'roboto' | 'lato' | 'source-sans';
  // Layout
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  // Header
  headerStyle: 'transparent' | 'solid' | 'gradient';
  // Buttons
  buttonStyle: 'solid' | 'outline' | 'soft';
  // Product cards
  cardStyle: 'minimal' | 'bordered' | 'elevated' | 'glass';
  // Homepage
  heroStyle: 'full' | 'split' | 'minimal';
  showFeaturedCategories: boolean;
  showTestimonials: boolean;
  showNewsletter: boolean;
};

export type ShippingSettings = {
  flatRate: number;
  freeShippingThreshold: number;
  shippingInfo: string;
};

export type SeoSettings = {
  siteTitle: string;
  siteDescription: string;
  ogImage: string;
  googleAnalyticsId?: string;
};

export type SocialSettings = {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tiktok?: string;
};

export type NotificationSettings = {
  orderEmail: string;
  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  lowStockThreshold: number;
};

// Types
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
