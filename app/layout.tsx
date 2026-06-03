import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";
const SITE_NAME = "RIVISIG Consultores";
const SITE_DESCRIPTION =
  "Consultora especializada en implementación, certificación y soporte de Sistemas de Gestión ISO 9001, 14001, 45001, 27001 y más. Plataforma de capacitación con certificados verificables.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Capacitación y consultoría en Sistemas de Gestión ISO`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "ISO 9001",
    "ISO 14001",
    "ISO 45001",
    "ISO 27001",
    "ISO 37001",
    "ISO 21001",
    "ISO 22000",
    "ISO 50001",
    "Sistemas de Gestión",
    "Certificación ISO",
    "Homologaciones",
    "Seguridad y Salud en el Trabajo",
    "SST",
    "SUNAFIL",
    "Capacitación corporativa",
    "Cursos ISO online",
    "Consultoría ISO Perú",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "business",
  alternates: {
    canonical: "/",
    languages: {
      "es-PE": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Capacitación y consultoría ISO`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rivisig",
    creator: "@rivisig",
    title: `${SITE_NAME} — Capacitación y consultoría ISO`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "any" }],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://checkout.culqi.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://checkout.culqi.com" />
      </head>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
