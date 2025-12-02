import { createRouteHandler, createUploadthing } from 'uploadthing/server';

const f = createUploadthing();

/**
 * Uploadthing File Router
 * Defines the allowed file types and sizes for each upload endpoint
 */
const uploadRouter = {
  // Product images
  productImage: f({
    image: { maxFileSize: '8MB', maxFileCount: 10 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, key: file.key, name: file.name };
  }),

  // Category images
  categoryImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, key: file.key, name: file.name };
  }),

  // Bundle images
  bundleImage: f({
    image: { maxFileSize: '8MB', maxFileCount: 5 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, key: file.key, name: file.name };
  }),

  // Page images (for CMS pages)
  pageImage: f({
    image: { maxFileSize: '8MB', maxFileCount: 10 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, key: file.key, name: file.name };
  }),

  // Branding assets (logo, favicon, etc.)
  brandingAsset: f({
    image: { maxFileSize: '2MB', maxFileCount: 1 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, key: file.key, name: file.name };
  }),

  // Product videos
  productVideo: f({
    video: { maxFileSize: '64MB', maxFileCount: 3 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, key: file.key, name: file.name };
  }),

  // General purpose uploads
  misc: f({
    image: { maxFileSize: '8MB', maxFileCount: 5 },
    video: { maxFileSize: '64MB', maxFileCount: 1 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, key: file.key, name: file.name };
  }),
};

// Create the route handler
const handler = createRouteHandler({
  router: uploadRouter,
});

/**
 * Handle GET requests (used for polling upload status)
 */
export async function GET(request: Request): Promise<Response> {
  return handler(request);
}

/**
 * Handle POST requests (used for initiating uploads)
 */
export async function POST(request: Request): Promise<Response> {
  return handler(request);
}

// Export endpoint names for client usage
export const UPLOAD_ENDPOINTS = [
  'productImage',
  'categoryImage',
  'bundleImage',
  'pageImage',
  'brandingAsset',
  'productVideo',
  'misc',
] as const;

export type UploadEndpoint = (typeof UPLOAD_ENDPOINTS)[number];
