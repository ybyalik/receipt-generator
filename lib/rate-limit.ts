import type { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter.
 * Returns true if the request should be allowed, false if rate limited.
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  { maxRequests = 10, windowMs = 60 * 1000 }: { maxRequests?: number; windowMs?: number } = {}
): boolean {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  const key = `${ip}:${req.url}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return false;
  }

  return true;
}
