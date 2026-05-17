type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const LIMITS = {
  "blog:mutation":       { max: 30, windowMs: 60_000 },
  "blog:upload":         { max: 10, windowMs: 60_000 },
  "auth:login":          { max: 10, windowMs: 5 * 60_000 },
  "auth:register":       { max: 5,  windowMs: 60 * 60_000 },
  "payment:culqi":       { max: 5,  windowMs: 60_000 },
  "payment:certificate": { max: 5,  windowMs: 60_000 },
  "cloudinary:sign":     { max: 30, windowMs: 60_000 },
  "certificate:verify":  { max: 20, windowMs: 60_000 },
  "auth:password-reset:request": { max: 5,  windowMs: 60 * 60_000 },
  "auth:password-reset:email":   { max: 3,  windowMs: 60 * 60_000 },
  "auth:password-reset:confirm": { max: 10, windowMs: 60 * 60_000 },
} as const;

export type RateLimitKey = keyof typeof LIMITS;

export function checkRateLimit(
  identifier: string,
  key: RateLimitKey,
): { allowed: boolean; retryInSeconds?: number } {
  const config = LIMITS[key];
  if (!config) return { allowed: true };

  const bucketKey = `${key}:${identifier}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (bucket.count >= config.max) {
    return {
      allowed: false,
      retryInSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}
