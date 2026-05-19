/**
 * Devuelve la IP del cliente de forma resistente a spoofing en Vercel.
 *
 * `x-forwarded-for` es escribible por el cliente, así que NO se confía en él
 * como primera opción. En Vercel/serverless el proxy de la plataforma fija
 * `x-real-ip` con la IP real de la conexión y el cliente no puede sobrescribirla;
 * por eso se prioriza. El primer valor de `x-forwarded-for` queda sólo como
 * fallback. Si no hay ninguna fuente fiable, devuelve `"unknown"`.
 */
export function getClientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}

/**
 * Identificador para rate limiting. Cuando no hay IP fiable, todas las
 * peticiones compartirían el bucket "unknown" (un atacante anularía el límite
 * y bloquearía a usuarios legítimos). Si se pasa un `fallback` (p. ej. el email
 * en flujos de auth), se usa como segundo factor para mantener el límite por
 * víctima aunque la IP no esté disponible.
 */
export function getRateLimitId(headers: Headers, fallback?: string): string {
  const ip = getClientIp(headers);
  if (ip !== "unknown") return ip;
  if (fallback) return `fallback:${fallback}`;
  return "unknown";
}
