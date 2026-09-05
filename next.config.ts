import type { NextConfig } from "next";

// CSP como segunda capa frente a XSS (el blog usa dangerouslySetInnerHTML, ya
// saneado con sanitize-html). Los orígenes externos son los realmente usados:
// Culqi (checkout/pagos), Cloudinary (imágenes/uploads) y Vimeo (player).
// Sólo se aplica en producción: en dev, HMR/React-Refresh usan eval/inline y
// una CSP estricta rompería `next dev`.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.culqi.com https://*.culqi.com https://upload-widget.cloudinary.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://upload-widget.cloudinary.com",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self' https://api.culqi.com https://*.culqi.com https://api.cloudinary.com https://res.cloudinary.com https://upload-widget.cloudinary.com",
  "frame-src https://checkout.culqi.com https://*.culqi.com https://player.vimeo.com https://upload-widget.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : []),
];

const nextConfig: NextConfig = {
  // El certificado PDF se renderiza en el servidor leyendo fuentes e imágenes
  // del disco, así que deben viajar dentro del bundle de esa ruta.
  outputFileTracingIncludes: {
    "/api/certificates/[code]/download": [
      "./public/fonts/**",
      "./public/images/logo.png",
      "./public/images/sello-transparent.png",
      "./public/images/icon.png",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
