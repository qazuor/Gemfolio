import { S3Client } from '@aws-sdk/client-s3';

// Environment variables for R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? 'gemfolio';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';

// Validate required environment variables
function validateConfig() {
  const missing: string[] = [];

  if (!R2_ACCOUNT_ID) missing.push('R2_ACCOUNT_ID');
  if (!R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
  if (!R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');

  if (missing.length > 0) {
    console.warn(`Missing R2 configuration: ${missing.join(', ')}`);
  }

  return missing.length === 0;
}

// Create S3 client configured for Cloudflare R2
export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Export configuration
export const storageConfig = {
  bucketName: R2_BUCKET_NAME,
  publicUrl: R2_PUBLIC_URL,
  isConfigured: validateConfig(),
};

export type StorageConfig = typeof storageConfig;
