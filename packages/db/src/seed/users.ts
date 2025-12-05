import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';

import type { Database } from '../client';
import { accounts, users } from '../schema/users';

const ADMIN_PASSWORD = '123';

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
    // Create admin user
    const [newUser] = await db.insert(users).values(adminUser).returning();
    console.log(`  ✓ Created admin user: ${adminUser.email}`);

    // Hash password and create credential account
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    await db.insert(accounts).values({
      userId: newUser.id,
      accountId: newUser.id,
      providerId: 'credential',
      password: hashedPassword,
    });
    console.log(`  ✓ Set password for admin user`);
  } else {
    console.log(`  - Admin user already exists: ${adminUser.email}`);

    // Check if credential account exists
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.userId, existing.id),
    });

    if (!existingAccount) {
      // Create credential account for existing user
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);
      await db.insert(accounts).values({
        userId: existing.id,
        accountId: existing.id,
        providerId: 'credential',
        password: hashedPassword,
      });
      console.log(`  ✓ Added password to existing admin user`);
    }
  }

  console.log('✅ Users seeded successfully\n');
}
