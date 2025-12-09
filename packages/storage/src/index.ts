// Config (shared between client and server)

// Client (React hooks and components)
export {
  UploadButton,
  UploadDropzone,
  uploadFiles,
  useUploadThing,
} from './client';
export { ASSET_FOLDERS, type AssetFolder, FILE_CONFIG, isConfigured } from './config';
// Client-safe utils
export { extractKeyFromUrl, isUploadthingUrl } from './utils';

// Types for endpoint names (no runtime code)
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
