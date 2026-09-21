import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export type CloudinaryAsset = {
  resourceType: "image" | "raw" | "video";
  deliveryType: string;
  /** Para `raw` incluye la extensión; para `image`/`video` no. */
  publicId: string;
  format: string;
};

const DELIVERY_URL =
  /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|raw|video)\/([^/]+)\/(.+)$/;

/**
 * Descompone una URL de entrega de Cloudinary en las piezas que necesita la
 * Admin API (`public_id`, `resource_type`, `type`, `format`).
 *
 * Devuelve `null` si la URL no es de Cloudinary: el llamador debe tratar ese
 * caso como "enlace externo" y no intentar firmarlo.
 */
export function parseCloudinaryUrl(rawUrl: string): CloudinaryAsset | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const match = DELIVERY_URL.exec(url.origin + url.pathname);
  if (!match) return null;

  const [, , resourceType, deliveryType, rest] = match;

  // Quitar la firma (s--xxxx--) y la versión (v123456) del path si existen.
  const segments = rest
    .split("/")
    .filter((s) => !/^s--[\w-]+--$/.test(s) && !/^v\d+$/.test(s))
    .map(decodeURIComponent);

  const path = segments.join("/");
  if (!path) return null;

  const dot = path.lastIndexOf(".");
  const format = dot > 0 ? path.slice(dot + 1) : "";

  return {
    resourceType: resourceType as CloudinaryAsset["resourceType"],
    deliveryType,
    // En `raw` el public_id conserva la extensión; en imagen/vídeo no.
    publicId: resourceType === "raw" ? path : dot > 0 ? path.slice(0, dot) : path,
    format,
  };
}

/**
 * URL firmada contra la API de descarga de Cloudinary.
 *
 * La usamos en lugar de la URL pública de `res.cloudinary.com` porque los
 * entornos de Cloudinary bloquean por defecto la entrega de PDF ("restricted
 * media types"): la URL pública responde 401 `deny or ACL failure` aunque el
 * archivo exista y aunque se firme la URL de entrega. Este endpoint va
 * autenticado con api_key + firma y sí devuelve el original.
 */
export function signedDownloadUrl(asset: CloudinaryAsset): string {
  return cloudinary.utils.private_download_url(asset.publicId, asset.format, {
    resource_type: asset.resourceType,
    type: asset.deliveryType,
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });
}
