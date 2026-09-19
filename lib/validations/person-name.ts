import { z } from "zod";

export const NOMBRE_MIN = 2;
export const NOMBRE_MAX = 80;

/**
 * Letras (con tildes y diacríticos), espacios y los signos que aparecen en
 * nombres reales: apóstrofo, guion y punto de abreviatura. Quedan fuera los
 * dígitos, emojis y símbolos, que se verían mal impresos en un certificado.
 */
const NOMBRE_PERMITIDO = /^[\p{L}\p{M}][\p{L}\p{M}'’.\- ]*$/u;

/**
 * Deja el nombre como se debe guardar: sin espacios sobrantes ni saltos de
 * línea, y con los acentos en forma compuesta para que "José" escrito desde
 * distintos teclados sea siempre la misma cadena.
 */
export function normalizePersonName(raw: string): string {
  return raw.normalize("NFC").replace(/\s+/g, " ").trim();
}

/**
 * Nombre de una persona física. Se usa en registro, perfil, alta de usuarios
 * desde el admin y titular de certificados manuales, para que el nombre que
 * termina impreso siempre haya pasado por las mismas reglas.
 */
export const personNameSchema = z
  .string({ error: "El nombre es obligatorio" })
  .transform(normalizePersonName)
  .refine((v) => v.length >= NOMBRE_MIN, {
    error: `El nombre debe tener al menos ${NOMBRE_MIN} caracteres`,
  })
  .refine((v) => v.length <= NOMBRE_MAX, {
    error: `El nombre no puede superar los ${NOMBRE_MAX} caracteres`,
  })
  .refine((v) => NOMBRE_PERMITIDO.test(v), {
    error: "El nombre solo admite letras, espacios, apóstrofos y guiones",
  });

/** Valida un nombre fuera de un esquema mayor. */
export function parsePersonName(
  raw: unknown,
): { name: string } | { error: string } {
  const parsed = personNameSchema.safeParse(
    typeof raw === "string" ? raw : "",
  );

  return parsed.success
    ? { name: parsed.data }
    : { error: parsed.error.issues[0]?.message ?? "Nombre inválido" };
}
