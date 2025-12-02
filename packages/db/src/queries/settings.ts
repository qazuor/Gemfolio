import { eq, inArray } from 'drizzle-orm';

import type { Database } from '../client';
import {
  type BrandingSettings,
  type GeneralSettings,
  type SeoSettings,
  type Setting,
  type ShippingSettings,
  type SocialSettings,
  settings,
} from '../schema/settings';

// ============================================
// TYPES
// ============================================
export type SettingsGroup =
  | 'general'
  | 'branding'
  | 'shipping'
  | 'seo'
  | 'social'
  | 'notifications';

export type PublicSettings = {
  general?: Partial<GeneralSettings>;
  branding?: Partial<BrandingSettings>;
  shipping?: Partial<ShippingSettings>;
  seo?: Partial<SeoSettings>;
  social?: Partial<SocialSettings>;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get all settings
 */
export async function getAllSettings(db: Database): Promise<Setting[]> {
  return db.select().from(settings);
}

/**
 * Get settings by group
 */
export async function getSettingsByGroup(db: Database, group: SettingsGroup): Promise<Setting[]> {
  return db.select().from(settings).where(eq(settings.group, group));
}

/**
 * Get setting by key
 */
export async function getSettingByKey(db: Database, key: string): Promise<Setting | null> {
  const [setting] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return setting ?? null;
}

/**
 * Get public settings (for storefront)
 */
export async function getPublicSettings(db: Database): Promise<PublicSettings> {
  const publicGroups: SettingsGroup[] = ['general', 'branding', 'shipping', 'seo', 'social'];

  const allSettings = await db.select().from(settings).where(inArray(settings.group, publicGroups));

  const result: PublicSettings = {};

  for (const setting of allSettings) {
    const group = setting.group as keyof PublicSettings;
    if (!result[group]) {
      result[group] = {};
    }
    // Extract just the value from the setting
    Object.assign(result[group]!, setting.value);
  }

  return result;
}

/**
 * Upsert a setting (create or update)
 */
export async function upsertSetting(
  db: Database,
  key: string,
  value: unknown,
  group: SettingsGroup
): Promise<Setting> {
  const existing = await getSettingByKey(db, key);

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    if (!updated) {
      throw new Error('Failed to update setting');
    }
    return updated;
  }

  const [created] = await db.insert(settings).values({ key, value, group }).returning();
  if (!created) {
    throw new Error('Failed to create setting');
  }
  return created;
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  db: Database,
  updates: Array<{ key: string; value: unknown; group: SettingsGroup }>
): Promise<void> {
  for (const update of updates) {
    await upsertSetting(db, update.key, update.value, update.group);
  }
}

/**
 * Delete a setting
 */
export async function deleteSetting(db: Database, key: string): Promise<boolean> {
  const result = await db.delete(settings).where(eq(settings.key, key)).returning();
  return result.length > 0;
}
