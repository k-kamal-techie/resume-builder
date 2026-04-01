/**
 * In-memory sliding window rate limiter.
 * Each key (user ID) gets a window of timestamps.
 * Expired entries are pruned on every check.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 300_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Check and consume a rate limit token.
 * @param key   Unique key (e.g. `${userId}:${route}`)
 * @param config  Rate limit configuration
 * @returns Whether the request is allowed, remaining tokens, and reset time
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Prune expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    const resetMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(resetMs, 0),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.limit - entry.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Helper to create a 429 response with rate limit headers.
 */
export function rateLimitResponse(result: RateLimitResult) {
  return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(Math.ceil(result.resetMs / 1000)),
      "X-RateLimit-Remaining": String(result.remaining),
    },
  });
}
