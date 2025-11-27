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
