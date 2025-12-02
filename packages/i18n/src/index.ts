// Formatting utilities
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from './format';

// Message types
export type SupportedLocale = 'es' | 'en';
export type SupportedCurrency = 'ARS' | 'USD';

// Default locale
export const DEFAULT_LOCALE: SupportedLocale = 'es';
export const DEFAULT_CURRENCY: SupportedCurrency = 'ARS';

// Locale configuration
export const LOCALES: Record<SupportedLocale, { name: string; flag: string }> = {
  es: { name: 'Español', flag: '🇦🇷' },
  en: { name: 'English', flag: '🇺🇸' },
};

// Currency configuration
export const CURRENCIES: Record<SupportedCurrency, { symbol: string; name: string }> = {
  ARS: { symbol: '$', name: 'Peso Argentino' },
  USD: { symbol: 'US$', name: 'US Dollar' },
};
