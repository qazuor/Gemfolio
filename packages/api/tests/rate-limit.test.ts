import type { Context, Next } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rateLimiter } from '../src/middleware/rate-limit';

type MockContext = {
  req: {
    header: (key: string) => string | null;
  };
  json: ReturnType<typeof vi.fn>;
  header: ReturnType<typeof vi.fn>;
  res: { status: number };
  getResponses: () => { data: unknown; status: number }[];
  getHeaders: () => Record<string, string>;
};

const createMockContext = (ip: string | null = '127.0.0.1'): MockContext => {
  const responses: { data: unknown; status: number }[] = [];
  const headers: Record<string, string> = {};

  return {
    req: {
      header: (key: string) => {
        if (key === 'x-forwarded-for') {
          return ip;
        }
        if (key === 'x-real-ip') {
          return ip;
        }
        return null;
      },
    },
    res: { status: 200 },
    json: vi.fn((data: unknown, status?: number) => {
      responses.push({ data, status: status || 200 });
      return { data, status: status || 200 };
    }),
    header: vi.fn((key: string, value: string) => {
      headers[key] = value;
    }),
    getResponses: () => responses,
    getHeaders: () => headers,
  };
};

const createNext = (): Next => {
  return vi.fn(() => Promise.resolve()) as unknown as Next;
};

describe('Rate Limiter Middleware', () => {
  const originalCI = process.env.CI;
  const originalSkipRateLimit = process.env.SKIP_RATE_LIMIT;

  beforeEach(() => {
    vi.useFakeTimers();
    // Disable CI and SKIP_RATE_LIMIT checks so rate limiting actually works in tests
    delete process.env.CI;
    delete process.env.SKIP_RATE_LIMIT;
  });

  afterEach(() => {
    vi.useRealTimers();
    // Restore environment variables
    if (originalCI !== undefined) {
      process.env.CI = originalCI;
    }
    if (originalSkipRateLimit !== undefined) {
      process.env.SKIP_RATE_LIMIT = originalSkipRateLimit;
    }
  });

  it('should allow requests under the limit', async () => {
    const middleware = rateLimiter('test1', { windowMs: 60000, maxRequests: 5 });
    const c = createMockContext();
    const next = createNext();

    await middleware(c as unknown as Context, next);

    expect(next).toHaveBeenCalled();
    expect(c.getHeaders()['X-RateLimit-Limit']).toBe('5');
    expect(c.getHeaders()['X-RateLimit-Remaining']).toBe('4');
  });

  it('should block requests over the limit', async () => {
    const middleware = rateLimiter('test2', { windowMs: 60000, maxRequests: 3 });
    const next = createNext();

    // Make 3 allowed requests
    for (let i = 0; i < 3; i++) {
      const ctx = createMockContext('192.168.1.1');
      await middleware(ctx as unknown as Context, next);
    }

    // 4th request should be blocked
    const ctx4 = createMockContext('192.168.1.1');
    const next4 = createNext();
    await middleware(ctx4 as unknown as Context, next4);

    expect(next4).not.toHaveBeenCalled();
    expect(ctx4.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'RATE_LIMIT_EXCEEDED',
        }),
      }),
      429
    );
  });

  it('should reset after window expires', async () => {
    const middleware = rateLimiter('test3', { windowMs: 1000, maxRequests: 2 });
    const c = createMockContext('10.0.0.1');
    const next = createNext();

    // Make 2 requests
    await middleware(c as unknown as Context, next);
    await middleware(c as unknown as Context, next);

    // 3rd request should be blocked
    const c3 = createMockContext('10.0.0.1');
    const next3 = createNext();
    await middleware(c3 as unknown as Context, next3);
    expect(next3).not.toHaveBeenCalled();

    // Advance time past the window
    vi.advanceTimersByTime(1100);

    // 4th request should be allowed
    const c4 = createMockContext('10.0.0.1');
    const next4 = createNext();
    await middleware(c4 as unknown as Context, next4);
    expect(next4).toHaveBeenCalled();
  });

  it('should track different IPs separately', async () => {
    const middleware = rateLimiter('test4', { windowMs: 60000, maxRequests: 2 });
    const next = createNext();

    // Make 2 requests from IP A
    const cA1 = createMockContext('1.1.1.1');
    await middleware(cA1 as unknown as Context, next);
    const cA2 = createMockContext('1.1.1.1');
    await middleware(cA2 as unknown as Context, next);

    // Make 2 requests from IP B (should still work)
    const cB1 = createMockContext('2.2.2.2');
    await middleware(cB1 as unknown as Context, next);
    expect(cB1.getHeaders()['X-RateLimit-Remaining']).toBe('1');

    // 3rd request from IP A should be blocked
    const cA3 = createMockContext('1.1.1.1');
    const nextA3 = createNext();
    await middleware(cA3 as unknown as Context, nextA3);
    expect(nextA3).not.toHaveBeenCalled();
  });

  it('should use unknown for requests without IP', async () => {
    const middleware = rateLimiter('test5', { windowMs: 60000, maxRequests: 2 });
    const c = createMockContext(null);
    const next = createNext();

    await middleware(c as unknown as Context, next);

    expect(next).toHaveBeenCalled();
  });

  it('should set X-RateLimit-Reset header', async () => {
    const middleware = rateLimiter('test6', { windowMs: 60000, maxRequests: 5 });
    const c = createMockContext();
    const next = createNext();

    await middleware(c as unknown as Context, next);

    expect(c.getHeaders()['X-RateLimit-Reset']).toBeDefined();
    const resetSeconds = parseInt(c.getHeaders()['X-RateLimit-Reset'], 10);
    // Reset should be in seconds (not milliseconds), less than or equal to window
    expect(resetSeconds).toBeGreaterThan(0);
    expect(resetSeconds).toBeLessThanOrEqual(60);
  });

  it('should return Retry-After header when rate limited', async () => {
    const middleware = rateLimiter('test7', { windowMs: 60000, maxRequests: 1 });
    const next = createNext();

    // Make 1 allowed request
    const c1 = createMockContext('3.3.3.3');
    await middleware(c1 as unknown as Context, next);

    // 2nd request should be blocked with Retry-After
    const c2 = createMockContext('3.3.3.3');
    const next2 = createNext();
    await middleware(c2 as unknown as Context, next2);

    expect(c2.getHeaders()['Retry-After']).toBeDefined();
    const retryAfter = parseInt(c2.getHeaders()['Retry-After'], 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });
});
