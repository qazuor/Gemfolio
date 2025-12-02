import {
  type AssetFolder,
  deleteFileByUrl,
  generatePresignedUploadUrl,
  getStorageStatus,
  uploadFile,
} from '@gemfolio/storage';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

const assetFolders = ['products', 'categories', 'bundles', 'pages', 'branding', 'misc'] as const;

const presignedUrlSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  folder: z.enum(assetFolders),
  prefix: z.string().optional(),
});

const deleteSchema = z.object({
  url: z.string().url(),
});

export const adminUploadRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/upload/status - Check storage configuration status
   */
  .get('/status', async (c) => {
    const status = getStorageStatus();
    return success(c, status);
  })

  /**
   * POST /admin/upload/presigned - Get a presigned URL for direct upload
   */
  .post('/presigned', zValidator('json', presignedUrlSchema), async (c) => {
    const data = c.req.valid('json');

    const result = await generatePresignedUploadUrl({
      folder: data.folder as AssetFolder,
      filename: data.filename,
      mimeType: data.mimeType,
      prefix: data.prefix,
    });

    if (!result.success) {
      return errors.badRequest(c, result.error);
    }

    return success(c, {
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: result.publicUrl,
    });
  })

  /**
   * POST /admin/upload - Direct upload (for smaller files)
   */
  .post('/', async (c) => {
    const contentType = c.req.header('content-type') ?? '';

    if (!contentType.includes('multipart/form-data')) {
      return errors.badRequest(c, 'Content-Type debe ser multipart/form-data');
    }

    try {
      const formData = await c.req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as AssetFolder) ?? 'misc';
      const prefix = formData.get('prefix') as string | null;

      if (!file) {
        return errors.badRequest(c, 'No se proporcionó ningún archivo');
      }

      // Validate folder
      if (!assetFolders.includes(folder)) {
        return errors.badRequest(c, 'Carpeta inválida');
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadFile(buffer, {
        folder,
        filename: file.name,
        mimeType: file.type,
        prefix: prefix ?? undefined,
      });

      if (!result.success) {
        return errors.badRequest(c, result.error);
      }

      return success(
        c,
        {
          key: result.key,
          url: result.url,
        },
        201
      );
    } catch (err) {
      console.error('Error uploading file:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/upload - Delete a file by URL
   */
  .delete('/', zValidator('json', deleteSchema), async (c) => {
    const data = c.req.valid('json');

    const result = await deleteFileByUrl(data.url);

    if (!result.success) {
      return errors.badRequest(c, result.error ?? 'Error al eliminar el archivo');
    }

    return success(c, { deleted: true });
  });
