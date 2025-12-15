import { db } from '@gemfolio/db';
import {
  getAllSettings,
  getSettingsByGroup,
  updateSettings,
  upsertSetting,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

const settingsGroupSchema = z.enum([
  'general',
  'branding',
  'shipping',
  'seo',
  'social',
  'notifications',
]);

const updateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.any(), // Use any to ensure value is always present
  group: settingsGroupSchema,
});

const updateMultipleSchema = z.object({
  settings: z.array(updateSettingSchema),
});

const updateGroupSchema = z.object({
  settings: z.record(z.string(), z.unknown()),
});

export const adminSettingsRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/settings - Get all settings
   */
  .get('/', async (c) => {
    try {
      const allSettings = await getAllSettings(db);

      // Group settings by their group
      const grouped: Record<string, Record<string, unknown>> = {};

      for (const setting of allSettings) {
        if (!grouped[setting.group]) {
          grouped[setting.group] = {};
        }
        grouped[setting.group][setting.key] = setting.value;
      }

      return success(c, grouped);
    } catch (err) {
      console.error('Error fetching settings:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/settings/:group - Get settings by group
   */
  .get('/:group', zValidator('param', z.object({ group: settingsGroupSchema })), async (c) => {
    const group = c.req.param('group') as
      | 'general'
      | 'branding'
      | 'shipping'
      | 'seo'
      | 'social'
      | 'notifications';

    try {
      const groupSettings = await getSettingsByGroup(db, group);

      // Convert to a single object
      const result: Record<string, unknown> = {};
      for (const setting of groupSettings) {
        result[setting.key] = setting.value;
      }

      return success(c, result);
    } catch (err) {
      console.error('Error fetching settings group:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/settings - Update multiple settings
   */
  .patch('/', zValidator('json', updateMultipleSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      // Ensure proper typing for updateSettings
      const settingsToUpdate = data.settings.map((s) => ({
        key: s.key,
        value: s.value as unknown,
        group: s.group as 'general' | 'branding' | 'shipping' | 'seo' | 'social' | 'notifications',
      }));
      await updateSettings(db, settingsToUpdate);

      // Return updated settings
      const allSettings = await getAllSettings(db);
      const grouped: Record<string, Record<string, unknown>> = {};

      for (const setting of allSettings) {
        if (!grouped[setting.group]) {
          grouped[setting.group] = {};
        }
        grouped[setting.group][setting.key] = setting.value;
      }

      return success(c, grouped);
    } catch (err) {
      console.error('Error updating settings:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/settings/:group - Update settings for a specific group
   */
  .patch(
    '/:group',
    zValidator('param', z.object({ group: settingsGroupSchema })),
    zValidator('json', updateGroupSchema),
    async (c) => {
      const group = c.req.param('group') as
        | 'general'
        | 'branding'
        | 'shipping'
        | 'seo'
        | 'social'
        | 'notifications';
      const data = c.req.valid('json');

      try {
        // Update each setting in the group
        for (const [key, value] of Object.entries(data.settings)) {
          await upsertSetting(db, key, value, group);
        }

        // Return updated group settings
        const groupSettings = await getSettingsByGroup(db, group);
        const result: Record<string, unknown> = {};
        for (const setting of groupSettings) {
          result[setting.key] = setting.value;
        }

        return success(c, result);
      } catch (err) {
        console.error('Error updating settings group:', err);
        return errors.serverError(c);
      }
    }
  );
