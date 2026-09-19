import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | { toNumber(): number }) {
  if (typeof amount === "object" && "toNumber" in amount) {
    amount = amount.toNumber();
  }
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(Number(amount));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getCertificateEffectiveStatus(
  status: "ACTIVE" | "REVOKED" | "PENDING_PAYMENT" | "EXPIRED",
  expiresAt: Date | null
): "ACTIVE" | "REVOKED" | "PENDING_PAYMENT" | "EXPIRED" {
  if (status === "ACTIVE" && expiresAt !== null && new Date() > expiresAt) {
    return "EXPIRED";
  }
  return status;
}

/**
 * Nombre del titular tal como debe aparecer en un certificado: siempre en
 * mayúsculas.
 *
 * La base de datos conserva el nombre como lo escribió la persona ("José
 * Pérez"), porque en el resto de la plataforma se lee mejor así; la conversión
 * ocurre solo al presentar el certificado. Se usa el locale español para que
 * las vocales acentuadas suban a Á/É/Í/Ó/Ú y no pierdan la tilde.
 */
export function toCertificateHolderName(name: string): string {
  return name.toLocaleUpperCase("es-PE");
}
