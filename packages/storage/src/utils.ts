import { UTApi } from 'uploadthing/server';

// Initialize Uploadthing API client
const utapi = new UTApi();

/**
 * Delete a file by its key
 */
export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    await utapi.deleteFiles(key);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: 'Error al eliminar el archivo' };
  }
}

/**
 * Delete multiple files by their keys
 */
export async function deleteFiles(
  keys: string[]
): Promise<{ success: boolean; deleted: number; errors: string[] }> {
  if (keys.length === 0) {
    return { success: true, deleted: 0, errors: [] };
  }

  try {
    await utapi.deleteFiles(keys);
    return { success: true, deleted: keys.length, errors: [] };
  } catch (error) {
    console.error('Error deleting files:', error);
    return { success: false, deleted: 0, errors: [String(error)] };
  }
}

/**
 * Extract the file key from an Uploadthing URL
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    // Uploadthing URLs have the format: https://utfs.io/f/{key}
    const match = url.match(/\/f\/([^/?]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Delete a file by its URL
 */
export async function deleteFileByUrl(url: string): Promise<{ success: boolean; error?: string }> {
  const key = extractKeyFromUrl(url);

  if (!key) {
    return { success: false, error: 'URL inválida' };
  }

  return deleteFile(key);
}

/**
 * Check if a URL is from Uploadthing
 */
export function isUploadthingUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('utfs.io') || url.includes('uploadthing');
}

/**
 * Get file info from Uploadthing
 */
export async function getFileInfo(key: string) {
  try {
    const files = await utapi.getFileUrls(key);
    return files.data[0] ?? null;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}
