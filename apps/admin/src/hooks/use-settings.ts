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
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
};

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
