/**
 * Utilidades para aceptar cualquier forma de "enlace de Vimeo" en los
 * formularios de administración y guardarla en un formato único.
 *
 * Formato canónico guardado en BD: `"123456789"` o `"123456789/9a8b7c6d5e"`
 * cuando el video es privado/oculto y Vimeo añade un hash de privacidad. Es la
 * misma forma que tiene la ruta de una URL de Vimeo, así que sigue siendo
 * legible a simple vista y los IDs pelados que ya había guardados se leen sin
 * migrar nada.
 */

export type VimeoRef = { id: string; hash?: string };

/** Los IDs de Vimeo son numéricos; el hash de privacidad es alfanumérico. */
const ID = /^\d{6,}$/;
const HASH = /^[A-Za-z0-9]{6,}$/;

/**
 * Interpreta lo que el usuario pegue: el ID pelado, la URL de la barra de
 * direcciones, el enlace de "Compartir", el de un canal o álbum, la URL del
 * reproductor o incluso el `<iframe>` de inserción completo.
 *
 * Devuelve `null` si no hay un ID reconocible, para que el formulario pueda
 * avisar en vez de guardar algo que no se va a reproducir.
 */
export function parseVimeoInput(input: string): VimeoRef | null {
  const value = input.trim();
  if (!value) return null;

  if (ID.test(value)) return { id: value };

  // Formato canónico ya guardado: "id/hash".
  const stored = value.match(/^(\d{6,})\/([A-Za-z0-9]{6,})$/);
  if (stored) return { id: stored[1], hash: stored[2] };

  // Pegar el código de inserción completo: nos quedamos con el src del iframe.
  const iframeSrc = value.match(/src\s*=\s*["']([^"']+)["']/i);
  const candidate = iframeSrc ? iframeSrc[1] : value;

  let url: URL;
  try {
    url = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);

  // En /album/1/video/2 o /showcase/1/video/2 el ID es el que sigue a "video".
  const afterVideo = segments.findIndex((s) => s === "video" || s === "videos");
  const idIndex =
    afterVideo !== -1 && ID.test(segments[afterVideo + 1] ?? "")
      ? afterVideo + 1
      : segments.findIndex((s) => ID.test(s));

  if (idIndex === -1) return null;

  const id = segments[idIndex];
  const next = segments[idIndex + 1];
  const hash =
    url.searchParams.get("h") ?? (next && HASH.test(next) ? next : undefined);

  return hash ? { id, hash } : { id };
}

/** Pasa a la cadena que se guarda en BD. */
export function formatVimeoRef(ref: VimeoRef): string {
  return ref.hash ? `${ref.id}/${ref.hash}` : ref.id;
}

/**
 * Normaliza lo pegado al formato de BD. `""` para el campo vacío (el video es
 * opcional) y `null` cuando no se reconoce ningún video.
 */
export function normalizeVimeoInput(input: string): string | null {
  if (!input.trim()) return "";
  const ref = parseVimeoInput(input);
  return ref ? formatVimeoRef(ref) : null;
}

/** URL del reproductor para un valor guardado. `null` si el valor no sirve. */
export function vimeoEmbedUrl(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const ref = parseVimeoInput(stored);
  if (!ref) return null;

  const params = new URLSearchParams({
    color: "cd3429",
    title: "0",
    byline: "0",
    portrait: "0",
  });
  // Sin el hash, un video oculto responde 404 en el reproductor.
  if (ref.hash) params.set("h", ref.hash);

  return `https://player.vimeo.com/video/${ref.id}?${params}`;
}
