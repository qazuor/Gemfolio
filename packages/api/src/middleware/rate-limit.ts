import type { Context, Next } from 'hono';

type RateLimitStore = Map<string, { count: number; resetTime: number }>;

type RateLimitConfig = {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (c: Context) => string; // Function to generate key (default: IP)
  message?: string; // Error message
  skipFailedRequests?: boolean; // Don't count failed requests
  skip?: (c: Context) => boolean; // Skip rate limiting for certain requests
};

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many requests, please try again later',
  skipFailedRequests: false,
};

// In-memory store (for single instance)
// For production with multiple instances, use Redis
const stores = new Map<string, RateLimitStore>();

function getStore(name: string): RateLimitStore {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

function getClientKey(c: Context): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = c.req.header('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection IP or a default
  return 'unknown';
}

/**
 * Create a rate limiting middleware
 */
export function rateLimiter(name: string, config: Partial<RateLimitConfig> = {}) {
  const options = { ...defaultConfig, ...config };
  const store = getStore(name);

  return async (c: Context, next: Next) => {
    // Check if we should skip this request
    if (options.skip?.(c)) {
      return next();
    }

    const key = options.keyGenerator ? options.keyGenerator(c) : getClientKey(c);
    const now = Date.now();

    // Get or create entry for this key
    let entry = store.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      for (const [k, v] of store) {
        if (v.resetTime < now) {
          store.delete(k);
        }
      }
    }

    // Check if entry exists and is still valid
    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + options.windowMs };
      store.set(key, entry);
    }

    // Increment count
    entry.count++;

    // Set rate limit headers
    const remaining = Math.max(0, options.maxRequests - entry.count);
    const reset = Math.ceil((entry.resetTime - now) / 1000);

    c.header('X-RateLimit-Limit', String(options.maxRequests));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(reset));

    // Check if rate limit exceeded
    if (entry.count > options.maxRequests) {
      c.header('Retry-After', String(reset));
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: options.message,
          },
        },
        429
      );
    }

    // Process request
    const response = await next();

    // Optionally skip failed requests
    if (options.skipFailedRequests && c.res.status >= 400) {
      entry.count--;
    }

    return response;
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */

// General API rate limiter (100 requests per minute)
export const generalRateLimiter = rateLimiter('general', {
  windowMs: 60 * 1000,
  maxRequests: 100,
});

// Strict rate limiter for sensitive operations (10 requests per minute)
export const strictRateLimiter = rateLimiter('strict', {
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many attempts, please try again in a minute',
});

// Auth rate limiter (5 login attempts per minute)
export const authRateLimiter = rateLimiter('auth', {
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Too many login attempts, please try again later',
});

// Search rate limiter (30 requests per minute)
export const searchRateLimiter = rateLimiter('search', {
  windowMs: 60 * 1000,
  maxRequests: 30,
});

// Webhook rate limiter (1000 requests per minute - high limit for external services)
export const webhookRateLimiter = rateLimiter('webhook', {
  windowMs: 60 * 1000,
  maxRequests: 1000,
});
