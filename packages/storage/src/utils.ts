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
 * Check if a URL is from Uploadthing
 */
export function isUploadthingUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('utfs.io') || url.includes('uploadthing');
}
