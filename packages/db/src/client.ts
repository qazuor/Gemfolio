import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

// Determine if we're in production (Neon) or development (local postgres)
const isProduction = process.env.NODE_ENV === 'production';

// Get database URL with validation
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
}

// Create the appropriate database connection
function createDatabaseConnection() {
  const databaseUrl = getDatabaseUrl();

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

// Export singleton database instance
export const db = createDatabaseConnection();

// Export types
export type Database = typeof db;

// Re-export schema for convenience
export { schema };
