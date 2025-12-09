import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';
import type { FileRouter } from 'uploadthing/types';

// Use a type assertion to avoid importing server code
// The actual type checking happens at runtime on the server
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface OurFileRouter extends FileRouter {}

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
