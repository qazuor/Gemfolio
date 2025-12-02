type SupportedLocale = 'es' | 'en';
type SupportedCurrency = 'ARS' | 'USD';

const DEFAULT_LOCALE: SupportedLocale = 'es';
const DEFAULT_CURRENCY: SupportedCurrency = 'ARS';

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  options?: {
    currency?: SupportedCurrency;
    locale?: SupportedLocale;
  }
): string {
  const currency = options?.currency ?? DEFAULT_CURRENCY;
  const locale = options?.locale ?? DEFAULT_LOCALE;

  const localeMap: Record<SupportedLocale, string> = {
    es: 'es-AR',
    en: 'en-US',
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'ARS' ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date
 */
export function formatDate(
  date: Date | string,
  options?: {
    locale?: SupportedLocale;
    format?: 'short' | 'medium' | 'long' | 'full';
  }
): string {
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const format = options?.format ?? 'medium';

  const localeMap: Record<SupportedLocale, string> = {
    es: 'es-AR',
    en: 'en-US',
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: '2-digit' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return new Intl.DateTimeFormat(localeMap[locale], formatOptions[format]).format(dateObj);
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: Date | string,
  options?: {
    locale?: SupportedLocale;
    format?: 'short' | 'medium' | 'long';
  }
): string {
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const format = options?.format ?? 'medium';

  const localeMap: Record<SupportedLocale, string> = {
    es: 'es-AR',
    en: 'en-US',
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
    medium: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    long: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
  };

  return new Intl.DateTimeFormat(localeMap[locale], formatOptions[format]).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string,
  options?: {
    locale?: SupportedLocale;
  }
): string {
  const locale = options?.locale ?? DEFAULT_LOCALE;

  const localeMap: Record<SupportedLocale, string> = {
    es: 'es-AR',
    en: 'en-US',
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
  const absoluteDiff = Math.abs(diffInSeconds);

  const rtf = new Intl.RelativeTimeFormat(localeMap[locale], { numeric: 'auto' });

  if (absoluteDiff < 60) {
    return rtf.format(diffInSeconds, 'second');
  }
  if (absoluteDiff < 3600) {
    return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
  }
  if (absoluteDiff < 86400) {
    return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
  }
  if (absoluteDiff < 2592000) {
    return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
  }
  if (absoluteDiff < 31536000) {
    return rtf.format(Math.floor(diffInSeconds / 2592000), 'month');
  }
  return rtf.format(Math.floor(diffInSeconds / 31536000), 'year');
}

/**
 * Format a number with locale-specific formatting
 */
export function formatNumber(
  value: number,
  options?: {
    locale?: SupportedLocale;
    decimals?: number;
  }
): string {
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const decimals = options?.decimals ?? 0;

  const localeMap: Record<SupportedLocale, string> = {
    es: 'es-AR',
    en: 'en-US',
  };

  return new Intl.NumberFormat(localeMap[locale], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number,
  options?: {
    locale?: SupportedLocale;
    decimals?: number;
  }
): string {
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const decimals = options?.decimals ?? 0;

  const localeMap: Record<SupportedLocale, string> = {
    es: 'es-AR',
    en: 'en-US',
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}
