import { neon, neonConfig } from '@neondatabase/serverless';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

// Database instance type
type DatabaseInstance = NeonHttpDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;

// Singleton instance - lazy initialized
let dbInstance: DatabaseInstance | null = null;

// Get database URL with validation
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
}

// Create the appropriate database connection
function createDatabaseConnection(): DatabaseInstance {
  const databaseUrl = getDatabaseUrl();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Production: Use Neon serverless
    neonConfig.fetchConnectionCache = true;
    const sql = neon(databaseUrl);
    return drizzleNeon(sql, { schema });
  }

  // Development: Use postgres.js for local PostgreSQL (Docker)
  const client = postgres(databaseUrl, {
    max: 10, // Maximum number of connections
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout
  });
  return drizzlePostgres(client, { schema });
}

// Lazy getter for database instance
// This ensures the connection is only created when first accessed at runtime,
// not during module initialization (important for serverless deployments)
function getDb(): DatabaseInstance {
  if (!dbInstance) {
    dbInstance = createDatabaseConnection();
  }
  return dbInstance;
}

export const db = new Proxy({} as DatabaseInstance, {
  get(_target, prop) {
    const instance = getDb();
    // biome-ignore lint/suspicious/noExplicitAny: Proxy requires any for dynamic property access
    return (instance as any)[prop];
  },
});

// Export types
export type Database = DatabaseInstance;

// Re-export schema for convenience
export { schema };
