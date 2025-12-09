import { UTApi } from 'uploadthing/server';

import { extractKeyFromUrl } from './utils';

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
