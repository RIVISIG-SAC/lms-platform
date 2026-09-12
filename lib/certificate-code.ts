import { prisma } from "@/lib/prisma";

export const CERTIFICATE_CODE_PREFIX = "RIVS";

/** Alfabeto sin caracteres ambiguos (0/O, 1/I). */
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Genera un código con el formato canónico `RIVS-XXX-XXX`. */
export function randomCertificateCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    if (i > 0 && i % 3 === 0) code += "-";
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `${CERTIFICATE_CODE_PREFIX}-${code}`;
}

/** Genera un código único verificando que no exista en la base de datos. */
export async function generateUniqueCertificateCode(): Promise<string> {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = randomCertificateCode();
    const existing = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("No se pudo generar un código de verificación único.");
}

/**
 * Forma canónica de comparación: solo alfanuméricos en mayúsculas.
 * Permite que el usuario escriba el código con o sin guiones, con espacios
 * o en minúsculas y que aun así se encuentre el certificado.
 */
export function normalizeCertificateCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Busca el `verificationCode` real a partir de lo que escribió el usuario,
 * comparando ambos lados en su forma normalizada.
 * Devuelve `null` si no existe ningún certificado con ese código.
 */
export async function resolveVerificationCode(
  input: string,
): Promise<string | null> {
  const normalized = normalizeCertificateCode(input);
  if (!normalized) return null;

  const rows = await prisma.$queryRaw<{ verificationCode: string }[]>`
    SELECT "verificationCode"
    FROM "Certificate"
    WHERE regexp_replace(upper("verificationCode"), '[^A-Z0-9]', '', 'g') = ${normalized}
    LIMIT 1
  `;

  return rows[0]?.verificationCode ?? null;
}
