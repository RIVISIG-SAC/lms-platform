import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Tiempo máximo que puede durar un cobro antes de considerar el lock huérfano. */
const LOCK_TTL_MS = 60_000;

/**
 * Candado distribuido para no cobrar dos veces lo mismo.
 *
 * Los tokens de Culqi NO son de un solo uso: dos peticiones simultáneas con el
 * mismo token (doble clic, dos pestañas) generan dos cargos. Se reutiliza la
 * tabla `RateLimit` (clave única) como lock para no necesitar una migración.
 */
export async function acquirePaymentLock(key: string): Promise<boolean> {
  const lockKey = `payment-lock:${key}`;
  const now = new Date();

  // Un lock vencido es de una petición que murió a mitad de camino.
  await prisma.rateLimit.deleteMany({ where: { key: lockKey, resetAt: { lt: now } } });

  try {
    await prisma.rateLimit.create({
      data: { key: lockKey, count: 1, resetAt: new Date(now.getTime() + LOCK_TTL_MS) },
    });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return false;
    }
    throw err;
  }
}

export async function releasePaymentLock(key: string): Promise<void> {
  await prisma.rateLimit
    .deleteMany({ where: { key: `payment-lock:${key}` } })
    .catch((err) => console.error("[paymentLock] no se pudo liberar:", err));
}
