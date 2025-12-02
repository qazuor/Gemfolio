import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createId } from '@paralleldrive/cuid2';

import { s3Client, storageConfig } from './client';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Folder paths for different asset types
export type AssetFolder = 'products' | 'categories' | 'bundles' | 'pages' | 'branding' | 'misc';

/**
 * Generate a unique file key with folder organization
 */
export function generateFileKey(
  folder: AssetFolder,
  originalFilename: string,
  prefix?: string
): string {
  const ext = originalFilename.split('.').pop()?.toLowerCase() ?? 'bin';
  const uniqueId = createId();
  const timestamp = Date.now();

  if (prefix) {
    return `${folder}/${prefix}/${timestamp}-${uniqueId}.${ext}`;
  }

  return `${folder}/${timestamp}-${uniqueId}.${ext}`;
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: 'image' | 'video' | 'all' = 'all'
): { valid: boolean; error?: string } {
  let allowed: string[];

  switch (allowedTypes) {
    case 'image':
      allowed = ALLOWED_IMAGE_TYPES;
      break;
    case 'video':
      allowed = ALLOWED_VIDEO_TYPES;
      break;
    default:
      allowed = ALLOWED_TYPES;
  }

  if (!allowed.includes(mimeType)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${allowed.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  mimeType: string
): { valid: boolean; error?: string } {
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload a file to R2
 */
export async function uploadFile(
  buffer: Buffer | Uint8Array,
  options: {
    folder: AssetFolder;
    filename: string;
    mimeType: string;
    prefix?: string;
  }
): Promise<{ success: true; key: string; url: string } | { success: false; error: string }> {
  const { folder, filename, mimeType, prefix } = options;

  // Validate file type
  const typeValidation = validateFileType(mimeType);
  if (!typeValidation.valid) {
    return { success: false, error: typeValidation.error! };
  }

  // Validate file size
  const sizeValidation = validateFileSize(buffer.length, mimeType);
  if (!sizeValidation.valid) {
    return { success: false, error: sizeValidation.error! };
  }

  // Generate unique key
  const key = generateFileKey(folder, filename, prefix);

  try {
    const command = new PutObjectCommand({
      Bucket: storageConfig.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await s3Client.send(command);

    const url = `${storageConfig.publicUrl}/${key}`;

    return { success: true, key, url };
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    return { success: false, error: 'Error al subir el archivo' };
  }
}

/**
 * Generate a presigned URL for direct upload from client
 */
export async function generatePresignedUploadUrl(options: {
  folder: AssetFolder;
  filename: string;
  mimeType: string;
  prefix?: string;
  expiresIn?: number; // seconds, default 1 hour
}): Promise<
  | { success: true; uploadUrl: string; key: string; publicUrl: string }
  | { success: false; error: string }
> {
  const { folder, filename, mimeType, prefix, expiresIn = 3600 } = options;

  // Validate file type
  const typeValidation = validateFileType(mimeType);
  if (!typeValidation.valid) {
    return { success: false, error: typeValidation.error! };
  }

  // Generate unique key
  const key = generateFileKey(folder, filename, prefix);

  try {
    const command = new PutObjectCommand({
      Bucket: storageConfig.bucketName,
      Key: key,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    const publicUrl = `${storageConfig.publicUrl}/${key}`;

    return { success: true, uploadUrl, key, publicUrl };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return { success: false, error: 'Error al generar URL de subida' };
  }
}

/**
 * Check if a file type is an image
 */
export function isImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

/**
 * Check if a file type is a video
 */
export function isVideoType(mimeType: string): boolean {
  return ALLOWED_VIDEO_TYPES.includes(mimeType);
}
