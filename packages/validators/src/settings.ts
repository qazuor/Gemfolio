import { z } from 'zod';

// General settings schema
export const generalSettingsSchema = z.object({
  businessName: z.string().min(1, 'Nombre del negocio es requerido').max(255),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  timezone: z.string().default('America/Argentina/Buenos_Aires'),
});

export type GeneralSettings = z.infer<typeof generalSettingsSchema>;

// Branding settings schema
export const brandingSettingsSchema = z.object({
  logo: z.string().url('URL de logo inválida').nullable().optional(),
  logoDark: z.string().url('URL de logo inválida').nullable().optional(),
  favicon: z.string().url('URL de favicon inválida').nullable().optional(),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color inválido')
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color inválido')
    .optional(),
});

export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;

// Shipping settings schema
export const shippingSettingsSchema = z.object({
  flatRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Costo inválido')
    .optional(),
  freeShippingThreshold: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido')
    .nullable()
    .optional(),
  shippingInfo: z.string().max(2000).optional(),
});

export type ShippingSettings = z.infer<typeof shippingSettingsSchema>;

// Notification settings schema
export const notificationSettingsSchema = z.object({
  orderNotificationEmail: z.string().email('Email inválido').optional(),
  notifyNewOrder: z.boolean().default(true),
  notifyLowStock: z.boolean().default(true),
  lowStockThreshold: z.number().int().min(0).default(5),
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

// SEO settings schema
export const seoSettingsSchema = z.object({
  defaultTitle: z.string().max(70).optional(),
  defaultDescription: z.string().max(160).optional(),
  ogImage: z.string().url('URL inválida').nullable().optional(),
  googleAnalyticsId: z.string().max(50).optional(),
});

export type SeoSettings = z.infer<typeof seoSettingsSchema>;

// Social media settings schema
export const socialSettingsSchema = z.object({
  instagram: z.string().url('URL inválida').nullable().optional(),
  facebook: z.string().url('URL inválida').nullable().optional(),
  whatsapp: z.string().max(20).optional(),
  tiktok: z.string().url('URL inválida').nullable().optional(),
  twitter: z.string().url('URL inválida').nullable().optional(),
});

export type SocialSettings = z.infer<typeof socialSettingsSchema>;

// All settings combined
export const allSettingsSchema = z.object({
  general: generalSettingsSchema.optional(),
  branding: brandingSettingsSchema.optional(),
  shipping: shippingSettingsSchema.optional(),
  notifications: notificationSettingsSchema.optional(),
  seo: seoSettingsSchema.optional(),
  social: socialSettingsSchema.optional(),
});

export type AllSettings = z.infer<typeof allSettingsSchema>;

// Update settings schema (for partial updates)
export const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  group: z.string().optional(),
});

export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
