import { eq } from 'drizzle-orm';

import type { Database } from '../client';
import { users } from '../schema/users';

const adminUser = {
  email: 'admin@gemfolio.com',
  name: 'Administrador',
  role: 'super_admin' as const,
  emailVerified: true,
};

export async function seedUsers(db: Database) {
  console.log('👤 Seeding users...');

  // Check if admin user already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, adminUser.email),
  });

  if (!existing) {
    await db.insert(users).values(adminUser);
    console.log(`  ✓ Created admin user: ${adminUser.email}`);
    console.log('  ⚠️  Note: You need to set up authentication to log in with this user.');
  } else {
    console.log(`  - Admin user already exists: ${adminUser.email}`);
  }

  console.log('✅ Users seeded successfully\n');
}
