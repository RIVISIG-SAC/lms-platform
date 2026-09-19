/**
 * Utilidades para transportar la intención del visitante ("a dónde quería ir")
 * a través del flujo registro → verificación de correo → login.
 */

/**
 * Devuelve la ruta sólo si es interna y segura.
 *
 * Se descartan las URLs absolutas y las protocol-relative (`//dominio`), que
 * `startsWith("/")` por sí solo dejaría pasar y permitirían un open redirect.
 */
export function sanitizeNextPath(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (!value.startsWith("/")) return undefined;
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined;
  return value;
}

/** Extrae el slug (o id) del curso de un `next` con forma `/cursos/<slug>`. */
export function courseSlugFromNextPath(next?: string): string | null {
  if (!next) return null;
  const path = next.split(/[?#]/)[0];
  const match = /^\/cursos\/([A-Za-z0-9._-]+)\/?$/.exec(path);
  return match ? match[1] : null;
}

/** Añade `?next=` a una ruta interna, ya codificado. */
export function withNextParam(href: string, next?: string): string {
  if (!next) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}next=${encodeURIComponent(next)}`;
}
