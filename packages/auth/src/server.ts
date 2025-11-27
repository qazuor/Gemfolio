import { db } from '@gemfolio/db/client';
import * as schema from '@gemfolio/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

/**
 * Better Auth server configuration
 * Used in API routes to handle authentication
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // Advanced configuration for cookie handling
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production if email verification is needed
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // User configuration
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'customer',
        input: false, // Not settable by user during registration
      },
    },
  },

  // Secret for signing tokens (required)
  secret: process.env.BETTER_AUTH_SECRET,

  // Base URL for auth API
  baseURL: process.env.BETTER_AUTH_URL,

  // Trusted origins for CORS
  trustedOrigins: [
    'http://localhost:3001', // Admin
    'http://localhost:4321', // Web
  ],
});

// Export auth type for client
export type Auth = typeof auth;
