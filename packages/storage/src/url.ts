import { storageConfig } from './client';

/**
 * Get the public URL for a file key
 */
export function getPublicUrl(key: string): string {
  if (!key) return '';

  // If it's already a full URL, return as-is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }

  // Construct the public URL
  return `${storageConfig.publicUrl}/${key}`;
}

/**
 * Check if a URL belongs to our storage
 */
export function isStorageUrl(url: string): boolean {
  if (!url || !storageConfig.publicUrl) return false;

  return url.startsWith(storageConfig.publicUrl);
}

/**
 * Get optimized image URL with optional transformations
 * Note: Cloudflare Images transformations can be applied via URL params
 * This is a placeholder for future image optimization
 */
export function getOptimizedImageUrl(
  key: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  }
): string {
  const baseUrl = getPublicUrl(key);

  // If no options or no public URL configured, return base URL
  if (!options || !storageConfig.publicUrl) {
    return baseUrl;
  }

  // Build transformation params
  // Note: This format depends on your CDN/image transformation service
  // For Cloudflare Images, you would use a different URL pattern
  const params = new URLSearchParams();

  if (options.width) params.set('w', String(options.width));
  if (options.height) params.set('h', String(options.height));
  if (options.quality) params.set('q', String(options.quality));
  if (options.format) params.set('f', options.format);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate thumbnail URL (convenience wrapper)
 */
export function getThumbnailUrl(key: string, size: number = 200): string {
  return getOptimizedImageUrl(key, { width: size, height: size });
}

/**
 * Get storage configuration status
 */
export function getStorageStatus(): {
  configured: boolean;
  publicUrl: string;
  bucketName: string;
} {
  return {
    configured: storageConfig.isConfigured,
    publicUrl: storageConfig.publicUrl,
    bucketName: storageConfig.bucketName,
  };
}
