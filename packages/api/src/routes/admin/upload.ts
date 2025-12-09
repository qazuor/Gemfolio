import { isConfigured, isUploadthingUrl } from '@gemfolio/storage';
import { deleteFileByUrl } from '@gemfolio/storage/server-utils';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

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
    return success(c, {
      configured: isConfigured(),
      provider: 'uploadthing',
    });
  })

  /**
   * DELETE /admin/upload - Delete a file by URL
   */
  .delete('/', zValidator('json', deleteSchema), async (c) => {
    const data = c.req.valid('json');

    // Verify it's an Uploadthing URL
    if (!isUploadthingUrl(data.url)) {
      return errors.badRequest(c, 'URL no es de Uploadthing');
    }

    const result = await deleteFileByUrl(data.url);

    if (!result.success) {
      return errors.badRequest(c, result.error ?? 'Error al eliminar el archivo');
    }

    return success(c, { deleted: true });
  });
