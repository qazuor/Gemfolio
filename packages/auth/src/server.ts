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

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production if email verification is needed
    // Password reset configuration
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement email sending in FASE 8
      // For now, log the reset URL for development
      console.log(`Password reset requested for ${user.email}`);
      console.log(`Reset URL: ${url}`);
      // In production, send email using Resend:
      // await sendPasswordResetEmail({ to: user.email, resetUrl: url });
    },
  },

  // Social OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    // cookieCache disabled - was causing issues where only session_data was set
    // without session_token, breaking session validation in E2E tests
    cookieCache: {
      enabled: false,
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

  // Advanced configuration
  advanced: {
    // Disable secure cookies in development/CI (required for localhost HTTP)
    useSecureCookies: process.env.NODE_ENV === 'production',
    // Default cookie attributes
    defaultCookieAttributes: {
      sameSite: 'lax',
      // secure is controlled by useSecureCookies
    },
  },

  // Plugins - none currently needed
  plugins: [],
});

// Export auth type for client
export type Auth = typeof auth;
