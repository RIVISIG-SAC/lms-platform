import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

import petApuntando from "@/assets/pets/pet-apuntando.webp";
import petBuscando from "@/assets/pets/pet-buscando.webp";
import petCaraFeliz from "@/assets/pets/pet-cara-feliz.webp";
import petCaraPensativa from "@/assets/pets/pet-cara-pensativa.webp";
import petCertificado from "@/assets/pets/pet-certificado.webp";
import petConfundido from "@/assets/pets/pet-confundido.webp";
import petExito from "@/assets/pets/pet-exito.webp";
import petOk from "@/assets/pets/pet-ok.webp";
import petSst from "@/assets/pets/pet-sst.webp";

/**
 * Poses de la mascota. Se importan de `assets/` (no de `public/`) para que el
 * bundler las versione con hash y las sirva con caché inmutable; sólo viaja al
 * cliente el metadato (src, ancho, alto), nunca el binario.
 *
 * Los renders todavía no tienen canal alfa: el fondo blanco está quemado en el
 * píxel, así que por ahora colócalas sobre superficies claras.
 */
const POSES = {
  /** Interrogantes y cara de duda. Para 404 y pantallas de error. */
  confundido: petConfundido,
  /** Con lupa. Para búsquedas y filtros sin resultados. */
  buscando: petBuscando,
  /** Check verde y puño en alto. Para confirmaciones y logros. */
  exito: petExito,
  /** Sosteniendo el diploma. Para verificación y certificados. */
  certificado: petCertificado,
  /** Con casco y chaleco reflectivo. Para servicios y contenidos de SST. */
  sst: petSst,
  /** Saluda y señala a la derecha. Para bloques CTA. */
  apuntando: petApuntando,
  /** Pulgar arriba, uso genérico. */
  ok: petOk,
  /** Sólo cabeza, sonriendo. Para avatares e indicadores pequeños. */
  "cara-feliz": petCaraFeliz,
  /** Sólo cabeza, pensativa. Para estados neutros o de espera. */
  "cara-pensativa": petCaraPensativa,
} satisfies Record<string, StaticImageData>;

export type PetPose = keyof typeof POSES;

type Props = {
  pose?: PetPose;
  /** Lado renderizado en px. Los renders son cuadrados (1254x1254). */
  size?: number;
  /**
   * Texto alternativo. Por defecto la mascota es decorativa y se oculta a
   * lectores de pantalla; pásalo sólo cuando aporte información.
   */
  alt?: string;
  priority?: boolean;
  className?: string;
};

export function PetMascot({
  pose = "ok",
  size = 280,
  alt,
  priority = false,
  className,
}: Props) {
  const decorativa = !alt;

  return (
    <Image
      src={POSES[pose]}
      alt={alt ?? ""}
      aria-hidden={decorativa || undefined}
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={cn("select-none object-contain", className)}
      draggable={false}
    />
  );
}
