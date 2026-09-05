import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Poses disponibles de la mascota. Cada clave apunta a un archivo en
 * `public/images/mascot/`. Al agregar una pose nueva basta con sumarla aquí.
 */
const POSES = {
  saludo: "/images/mascot/pet-rivisig.webp",
} as const;

export type PetPose = keyof typeof POSES;

type Props = {
  pose?: PetPose;
  /** Lado renderizado en px. La imagen original es cuadrada (1254x1254). */
  size?: number;
  /**
   * Texto alternativo. Por defecto la mascota es decorativa y se oculta a
   * lectores de pantalla; pásalo solo cuando aporte información.
   */
  alt?: string;
  priority?: boolean;
  className?: string;
};

export function PetMascot({
  pose = "saludo",
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
