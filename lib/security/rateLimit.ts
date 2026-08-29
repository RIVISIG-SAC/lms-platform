import { prisma } from "@/lib/prisma";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const LIMITS = {
  "blog:mutation":       { max: 30, windowMs: 60_000 },
  "blog:upload":         { max: 10, windowMs: 60_000 },
  "empresas:mutation":   { max: 30, windowMs: 60_000 },
  "auth:login":          { max: 10, windowMs: 5 * 60_000 },
  "auth:register":       { max: 5,  windowMs: 60 * 60_000 },
  "payment:culqi":       { max: 5,  windowMs: 60_000 },
  "payment:certificate": { max: 5,  windowMs: 60_000 },
  "cloudinary:sign":     { max: 30, windowMs: 60_000 },
  "certificate:verify":  { max: 20, windowMs: 60_000 },
  "auth:password-reset:request": { max: 5,  windowMs: 60 * 60_000 },
  "auth:password-reset:email":   { max: 3,  windowMs: 60 * 60_000 },
  "auth:password-reset:confirm": { max: 10, windowMs: 60 * 60_000 },
  "auth:verification-resend":    { max: 3,  windowMs: 60 * 60_000 },
} as const;

export type RateLimitKey = keyof typeof LIMITS;

type RateLimitResult = { allowed: boolean; retryInSeconds?: number };

/**
 * Rate limiter en memoria. NO sirve en serverless (cada instancia tiene su
 * propio Map y se reinicia en cold start). Úsalo sólo para flujos no críticos
 * (p. ej. mutaciones de blog). Para auth usa `checkRateLimitDb`.
 */
export function checkRateLimit(
  identifier: string,
  key: RateLimitKey,
): RateLimitResult {
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

/**
 * Rate limiter respaldado por Postgres (serverless-safe): el contador vive en
 * la BD compartida, así que persiste entre instancias y entre cold starts.
 * Úsalo para los flujos sensibles de autenticación.
 *
 * Ante un fallo de BD hace fail-open (permite la petición): el rate limiter no
 * debe convertirse en un punto único de caída del login. El lockout por cuenta
 * de `loginAction` sigue siendo la barrera dura contra fuerza bruta.
 */
export async function checkRateLimitDb(
  identifier: string,
  key: RateLimitKey,
): Promise<RateLimitResult> {
  const config = LIMITS[key];
  if (!config) return { allowed: true };

  const bucketKey = `${key}:${identifier}`;
  const now = new Date();

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.rateLimit.findUnique({
        where: { key: bucketKey },
      });

      // Ventana nueva o expirada → reiniciar el contador.
      if (!existing || existing.resetAt <= now) {
        const resetAt = new Date(now.getTime() + config.windowMs);
        await tx.rateLimit.upsert({
          where: { key: bucketKey },
          create: { key: bucketKey, count: 1, resetAt },
          update: { count: 1, resetAt },
        });
        return { allowed: true };
      }

      if (existing.count >= config.max) {
        return {
          allowed: false,
          retryInSeconds: Math.max(
            1,
            Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000),
          ),
        };
      }

      await tx.rateLimit.update({
        where: { key: bucketKey },
        data: { count: { increment: 1 } },
      });
      return { allowed: true };
    });
  } catch (err) {
    console.error("[checkRateLimitDb] fallo, fail-open:", err);
    return { allowed: true };
  }
}

/**
 * Borra de forma oportunista las ventanas expiradas para que la tabla no crezca
 * sin límite por IPs/emails distintos (p. ej. durante un ataque). Barato y
 * best-effort: se invoca con baja probabilidad desde los flujos de auth.
 */
export async function pruneExpiredRateLimits(): Promise<void> {
  if (Math.random() > 0.02) return;
  try {
    await prisma.rateLimit.deleteMany({
      where: { resetAt: { lt: new Date() } },
    });
  } catch {
    // best-effort, sin propagar
  }
}
