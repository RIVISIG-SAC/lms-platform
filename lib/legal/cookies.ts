/**
 * Inventario de cookies y almacenamiento del navegador.
 *
 * Es la fuente de verdad de la política de cookies: se declara aquí en vez de
 * escribirlo a mano en el JSX para que, al añadir o quitar un servicio, quede
 * un único sitio que actualizar y la página no se desincronice de la realidad.
 *
 * Al tocar este archivo hay que subir también `LEGAL_LAST_UPDATED.cookies`.
 */

export type CookieCategory = "necesaria" | "terceros";

export type CookieEntry = {
  /** Nombre técnico tal como aparece en el navegador. */
  nombre: string;
  /** Quién la instala. */
  proveedor: string;
  categoria: CookieCategory;
  finalidad: string;
  duracion: string;
  /** Dónde se instala, para que el usuario sepa cuándo aparece. */
  ambito: string;
};

export const COOKIE_CATEGORY_LABELS: Record<CookieCategory, string> = {
  necesaria: "Estrictamente necesaria",
  terceros: "De terceros",
};

/**
 * Cookies propias. Hoy la plataforma instala exactamente una.
 *
 * Los valores deben coincidir con `createSession()` en `lib/auth.ts`.
 */
export const COOKIES_PROPIAS: CookieEntry[] = [
  {
    nombre: "session",
    proveedor: "RIVISIG Consultores",
    categoria: "necesaria",
    finalidad:
      "Mantiene la sesión iniciada e identifica al usuario entre páginas. Sin ella no es posible acceder al campus ni a los cursos.",
    duracion: "7 días",
    ambito: "Todo el sitio, solo tras iniciar sesión",
  },
];

/**
 * Cookies que instalan servicios externos embebidos.
 *
 * No las controlamos: solo aparecen al usar la funcionalidad concreta que las
 * necesita, y su tratamiento se rige por la política del proveedor.
 */
export const COOKIES_TERCEROS: CookieEntry[] = [
  {
    nombre: "Cookies de Vimeo",
    proveedor: "Vimeo, Inc.",
    categoria: "terceros",
    finalidad:
      "Reproducir el video de cada clase, recordar la calidad y el volumen elegidos y evitar la recarga innecesaria del reproductor.",
    duracion: "Según la política de Vimeo",
    ambito: "Solo dentro del reproductor de un curso",
  },
  {
    nombre: "Cookies de Culqi",
    proveedor: "Culqi S.A.C.",
    categoria: "terceros",
    finalidad:
      "Procesar el pago de un curso o de un certificado de forma segura y prevenir el fraude durante la transacción.",
    duracion: "Según la política de Culqi",
    ambito: "Solo durante el proceso de pago",
  },
];

/** Servicios que se usan pero NO instalan cookies; se listan por transparencia. */
export const SERVICIOS_SIN_COOKIES = [
  {
    nombre: "Vercel Analytics",
    proveedor: "Vercel Inc.",
    detalle:
      "Mide visitas de forma agregada y anónima. No instala cookies ni almacena identificadores persistentes en el navegador, por lo que no permite reconocer a un visitante entre sesiones.",
  },
  {
    nombre: "Vercel",
    proveedor: "Vercel Inc.",
    detalle:
      "Aloja la plataforma y registra datos técnicos de cada petición (dirección IP, navegador, fecha) en sus registros de servidor, sin usar cookies.",
  },
  {
    nombre: "Cloudinary",
    proveedor: "Cloudinary Ltd.",
    detalle:
      "Entrega las imágenes y materiales de los cursos. Solo sirve archivos: no instala cookies en el navegador.",
  },
  {
    nombre: "Tipografía Geist",
    proveedor: "RIVISIG Consultores",
    detalle:
      "La fuente se descarga durante la compilación y se sirve desde nuestro propio dominio, así que no se hace ninguna petición a servidores externos al cargar la página.",
  },
] as const;

/** Instrucciones oficiales para gestionar cookies en cada navegador. */
export const GUIAS_NAVEGADOR = [
  {
    nombre: "Google Chrome",
    url: "https://support.google.com/chrome/answer/95647?hl=es",
  },
  {
    nombre: "Mozilla Firefox",
    url: "https://support.mozilla.org/es/kb/Borrar%20cookies",
  },
  {
    nombre: "Microsoft Edge",
    url: "https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
  },
  {
    nombre: "Safari",
    url: "https://support.apple.com/es-es/guide/safari/sfri11471/mac",
  },
] as const;

/** Políticas de privacidad de los terceros mencionados. */
export const POLITICAS_TERCEROS = [
  { nombre: "Vimeo", url: "https://vimeo.com/privacy" },
  { nombre: "Culqi", url: "https://culqi.com/politica-de-privacidad/" },
  { nombre: "Vercel", url: "https://vercel.com/legal/privacy-policy" },
  { nombre: "Cloudinary", url: "https://cloudinary.com/privacy" },
] as const;
