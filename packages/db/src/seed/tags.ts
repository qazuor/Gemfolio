import { eq } from 'drizzle-orm';

import type { Database } from '../client';
import { tags } from '../schema/tags';
import { slugify } from '../utils';

const systemTags = [
  { name: 'Nuevo', color: '#10B981' }, // Emerald green
  { name: 'Oferta', color: '#EF4444' }, // Red
  { name: 'Destacado', color: '#F59E0B' }, // Amber
  { name: 'Exclusivo', color: '#8B5CF6' }, // Purple
  { name: 'Agotado', color: '#6B7280' }, // Gray
  { name: 'Últimas unidades', color: '#F97316' }, // Orange
  { name: 'Más vendido', color: '#3B82F6' }, // Blue
];

export async function seedTags(db: Database) {
  console.log('🏷️  Seeding tags...');

  for (const tag of systemTags) {
    const slug = slugify(tag.name);

    // Check if tag already exists
    const existing = await db.query.tags.findFirst({
      where: eq(tags.slug, slug),
    });

    if (!existing) {
      await db.insert(tags).values({
        name: tag.name,
        slug,
        color: tag.color,
        type: 'system',
      });
      console.log(`  ✓ Created tag: ${tag.name}`);
    } else {
      console.log(`  - Tag already exists: ${tag.name}`);
    }
  }

  console.log('✅ Tags seeded successfully\n');
}
