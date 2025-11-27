import 'dotenv/config';

import { db } from '../client';
import { seedCategories } from './categories';
import { seedSettings } from './settings';
import { seedTags } from './tags';
import { seedUsers } from './users';

async function main() {
  console.log('\n🌱 Starting database seed...\n');
  console.log('━'.repeat(50));

  try {
    // Run seeds in order
    await seedSettings(db);
    await seedTags(db);
    await seedCategories(db);
    await seedUsers(db);

    console.log('━'.repeat(50));
    console.log('\n🎉 Database seeded successfully!\n');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
