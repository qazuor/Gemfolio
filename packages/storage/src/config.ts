// Uploadthing configuration

// Environment variable for the secret
export const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN ?? '';

// Check if Uploadthing is configured
export function isConfigured(): boolean {
  return !!UPLOADTHING_TOKEN;
}

// Allowed file types and sizes
export const FILE_CONFIG = {
  image: {
    maxSize: '8MB',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  },
  video: {
    maxSize: '64MB',
    allowedTypes: ['video/mp4', 'video/webm'],
  },
} as const;

// Asset folders for organization
export type AssetFolder = 'products' | 'categories' | 'bundles' | 'pages' | 'branding' | 'misc';

export const ASSET_FOLDERS: AssetFolder[] = [
  'products',
  'categories',
  'bundles',
  'pages',
  'branding',
  'misc',
];
