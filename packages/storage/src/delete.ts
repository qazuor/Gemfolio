import { DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';

import { s3Client, storageConfig } from './client';

/**
 * Delete a single file from R2
 */
export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: storageConfig.bucketName,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    return { success: false, error: 'Error al eliminar el archivo' };
  }
}

/**
 * Delete multiple files from R2 (batch delete)
 */
export async function deleteFiles(
  keys: string[]
): Promise<{ success: boolean; deleted: number; errors: string[] }> {
  if (keys.length === 0) {
    return { success: true, deleted: 0, errors: [] };
  }

  // R2 supports up to 1000 objects per request
  const batchSize = 1000;
  let deleted = 0;
  const errors: string[] = [];

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);

    try {
      const command = new DeleteObjectsCommand({
        Bucket: storageConfig.bucketName,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
          Quiet: true,
        },
      });

      const response = await s3Client.send(command);

      // Count deleted objects
      deleted += batch.length - (response.Errors?.length ?? 0);

      // Collect errors
      if (response.Errors && response.Errors.length > 0) {
        for (const err of response.Errors) {
          errors.push(`${err.Key}: ${err.Message}`);
        }
      }
    } catch (error) {
      console.error('Error batch deleting files from R2:', error);
      errors.push(`Batch error: ${String(error)}`);
    }
  }

  return {
    success: errors.length === 0,
    deleted,
    errors,
  };
}

/**
 * Extract the key from a public URL
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    // If it's a full URL, extract the path
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.slice(1);
    }

    // If it's already a key, return as-is
    return url;
  } catch {
    return null;
  }
}

/**
 * Delete a file by its public URL
 */
export async function deleteFileByUrl(url: string): Promise<{ success: boolean; error?: string }> {
  const key = extractKeyFromUrl(url);

  if (!key) {
    return { success: false, error: 'URL inválida' };
  }

  return deleteFile(key);
}
