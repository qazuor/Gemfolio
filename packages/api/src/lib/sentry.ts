import * as Sentry from '@sentry/node';
import type { Context, Next } from 'hono';

let isInitialized = false;

/**
 * Initialize Sentry for error tracking
 * Call this once at application startup
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  if (isInitialized) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '0.1.0',

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session tracking
    autoSessionTracking: true,

    // Integrations
    integrations: [
      Sentry.httpIntegration(),
      Sentry.captureConsoleIntegration({
        levels: ['error', 'warn'],
      }),
    ],

    // Filter out sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete (event.request.headers as Record<string, unknown>)['x-api-key'];
      }

      // Remove sensitive data from body
      if (event.request?.data) {
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
        for (const field of sensitiveFields) {
          if (typeof event.request.data === 'object' && field in event.request.data) {
            (event.request.data as Record<string, unknown>)[field] = '[REDACTED]';
          }
        }
      }

      return event;
    },
  });

  isInitialized = true;
  console.log('Sentry initialized for error tracking');
}

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return !!process.env.SENTRY_DSN && isInitialized;
}

/**
 * Capture an exception with Sentry
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!isSentryConfigured()) {
    console.error('Sentry not configured, logging error:', error);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message with Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!isSentryConfigured()) {
    console.log(`[${level}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (!isSentryConfigured()) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
) {
  if (!isSentryConfigured()) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
  });
}

/**
 * Sentry error handling middleware for Hono
 */
export function sentryMiddleware() {
  return async (c: Context, next: Next) => {
    // Add request breadcrumb
    addBreadcrumb(`${c.req.method} ${c.req.path}`, 'http.request', {
      url: c.req.url,
      method: c.req.method,
    });

    try {
      await next();
    } catch (error) {
      // Capture the error
      if (error instanceof Error) {
        captureException(error, {
          url: c.req.url,
          method: c.req.method,
          headers: Object.fromEntries(c.req.raw.headers),
        });
      }

      // Re-throw to let other error handlers deal with it
      throw error;
    }
  };
}

/**
 * Wrap an async function with Sentry error tracking
 */
export function withSentry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        captureException(error, { context, args: JSON.stringify(args).slice(0, 1000) });
      }
      throw error;
    }
  }) as T;
}

export { Sentry };
