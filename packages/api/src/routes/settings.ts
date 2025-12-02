import { db } from '@gemfolio/db';
import { getPublicSettings } from '@gemfolio/db/queries';
import { Hono } from 'hono';

import { errors, success } from '../lib/response';

export const settingsRoutes = new Hono()
  /**
   * GET /settings/public - Get public settings (for storefront)
   */
  .get('/public', async (c) => {
    try {
      const settings = await getPublicSettings(db);
      return success(c, settings);
    } catch (err) {
      console.error('Error fetching public settings:', err);
      return errors.serverError(c);
    }
  });
