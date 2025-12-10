import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
export type SettingsGroup =
  | 'general'
  | 'branding'
  | 'shipping'
  | 'seo'
  | 'social'
  | 'notifications';

export interface GeneralSettings {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  currency: 'ARS' | 'USD';
  timezone: string;
}

export interface BrandingSettings {
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
}

export interface ShippingSettings {
  flatRate: number;
  freeShippingThreshold: number;
  shippingInfo: string;
}

export interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  ogImage: string;
  googleAnalyticsId?: string;
}

export interface SocialSettings {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tiktok?: string;
}

export interface NotificationSettings {
  orderEmail: string;
  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  lowStockThreshold: number;
}

export interface AllSettings {
  general?: GeneralSettings;
  branding?: BrandingSettings;
  shipping?: ShippingSettings;
  seo?: SeoSettings;
  social?: SocialSettings;
  notifications?: NotificationSettings;
}

// Fetch functions
async function fetchAllSettings(): Promise<AllSettings> {
  const response = await fetch(`${API_BASE}/admin/settings`);
  if (!response.ok) {
    throw new Error('Error al cargar configuraciones');
  }
  const result = await response.json();
  return result.data;
}

async function fetchSettingsByGroup<T>(group: SettingsGroup): Promise<T> {
  const response = await fetch(`${API_BASE}/admin/settings/${group}`);
  if (!response.ok) {
    throw new Error('Error al cargar configuraciones');
  }
  const result = await response.json();
  return result.data;
}

async function updateSettingsByGroup<T>(group: SettingsGroup, settings: Partial<T>): Promise<T> {
  const response = await fetch(`${API_BASE}/admin/settings/${group}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar configuraciones');
  }
  const result = await response.json();
  return result.data;
}

// Hooks
export function useAllSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchAllSettings,
  });
}

export function useSettings<T>(group: SettingsGroup) {
  return useQuery({
    queryKey: ['settings', group],
    queryFn: () => fetchSettingsByGroup<T>(group),
  });
}

export function useUpdateSettings<T>(group: SettingsGroup) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<T>) => updateSettingsByGroup<T>(group, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings', group] });
      toast.success('Configuración guardada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Default values for settings
export const defaultGeneralSettings: GeneralSettings = {
  businessName: '',
  email: '',
  phone: '',
  address: '',
  currency: 'ARS',
  timezone: 'America/Argentina/Buenos_Aires',
};

export const defaultBrandingSettings: BrandingSettings = {
  logo: '',
  logoDark: '',
  favicon: '',
  primaryColor: '#B8860B',
  secondaryColor: '#1A1A1A',
  accentColor: '#D4AF37',
  headingFont: 'playfair',
  bodyFont: 'inter',
  borderRadius: 'medium',
  headerStyle: 'solid',
  buttonStyle: 'solid',
  cardStyle: 'elevated',
  heroStyle: 'full',
  showFeaturedCategories: true,
  showTestimonials: true,
  showNewsletter: true,
};

// Style options for dropdowns
export const headingFontOptions = [
  { value: 'playfair', label: 'Playfair Display (Elegante)' },
  { value: 'cormorant', label: 'Cormorant (Clásica)' },
  { value: 'libre-baskerville', label: 'Libre Baskerville (Tradicional)' },
  { value: 'lora', label: 'Lora (Moderna)' },
  { value: 'merriweather', label: 'Merriweather (Legible)' },
  { value: 'inter', label: 'Inter (Minimalista)' },
];

export const bodyFontOptions = [
  { value: 'inter', label: 'Inter (Moderna)' },
  { value: 'open-sans', label: 'Open Sans (Legible)' },
  { value: 'roboto', label: 'Roboto (Neutral)' },
  { value: 'lato', label: 'Lato (Amigable)' },
  { value: 'source-sans', label: 'Source Sans (Clara)' },
];

export const borderRadiusOptions = [
  { value: 'none', label: 'Sin bordes (0px)' },
  { value: 'small', label: 'Pequeño (4px)' },
  { value: 'medium', label: 'Medio (8px)' },
  { value: 'large', label: 'Grande (16px)' },
  { value: 'full', label: 'Completo (redondeado)' },
];

export const headerStyleOptions = [
  { value: 'solid', label: 'Sólido' },
  { value: 'transparent', label: 'Transparente' },
  { value: 'gradient', label: 'Degradado' },
];

export const buttonStyleOptions = [
  { value: 'solid', label: 'Sólido (relleno)' },
  { value: 'outline', label: 'Outline (borde)' },
  { value: 'soft', label: 'Suave (tenue)' },
];

export const cardStyleOptions = [
  { value: 'minimal', label: 'Minimalista' },
  { value: 'bordered', label: 'Con borde' },
  { value: 'elevated', label: 'Elevado (sombra)' },
  { value: 'glass', label: 'Glassmorphism' },
];

export const heroStyleOptions = [
  { value: 'full', label: 'Pantalla completa' },
  { value: 'split', label: 'Dividido (imagen + texto)' },
  { value: 'minimal', label: 'Minimalista' },
];

export const defaultShippingSettings: ShippingSettings = {
  flatRate: 0,
  freeShippingThreshold: 0,
  shippingInfo: '',
};

export const defaultSeoSettings: SeoSettings = {
  siteTitle: '',
  siteDescription: '',
  ogImage: '',
  googleAnalyticsId: '',
};

export const defaultSocialSettings: SocialSettings = {
  instagram: '',
  facebook: '',
  whatsapp: '',
  tiktok: '',
};

export const defaultNotificationSettings: NotificationSettings = {
  orderEmail: '',
  notifyNewOrder: true,
  notifyLowStock: true,
  lowStockThreshold: 5,
};

// Timezone options for Argentina
export const timezoneOptions = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/Argentina/Cordoba', label: 'Córdoba (GMT-3)' },
  { value: 'America/Argentina/Mendoza', label: 'Mendoza (GMT-3)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

export const currencyOptions = [
  { value: 'ARS', label: 'Peso Argentino (ARS)' },
  { value: 'USD', label: 'Dólar Estadounidense (USD)' },
];
