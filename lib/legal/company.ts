export const LEGAL_COMPANY = {
  razonSocial: "RIVISIG CONSULTORES S.A.C.",
  marca: "RIVISIG Consultores",
  ruc: "20614925621",

  ciudad: "Lima",
  pais: "Perú",
  email: "info@rivisig.com",
  emailDatos: "info@rivisig.com",
  telefono: "+51 965 772 053",
  telefonoTel: "+51965772053",
  sitio: "https://rivisig.com",
} as const;

export const COMPANY_SOCIALS = [
  "https://pe.linkedin.com/company/rivisig-sac",
  "https://www.facebook.com/RIVISIG.SAC",
  "https://www.instagram.com/rvgestion/",
  "https://www.tiktok.com/@rivisig",
  "https://www.youtube.com/@rivisig",
] as const;

export const LEGAL_LAST_UPDATED = {
  terminos: "2026-05-15",
  privacidad: "2026-09-19",
  cookies: "2026-09-19",
} as const;

/**
 * Versión de los documentos legales que el usuario aceptó al registrarse.
 *
 * Se guarda en `User.acceptedTermsVersion` y tiene valor probatorio: identifica
 * exactamente qué redacción estaba vigente en ese momento. Cada documento que
 * aparezca aquí debe estar enlazado en la casilla de aceptación del registro,
 * o estaríamos registrando un consentimiento que nunca se mostró.
 */
export function getLegalAcceptanceVersion(): string {
  return [
    `tyc:${LEGAL_LAST_UPDATED.terminos}`,
    `priv:${LEGAL_LAST_UPDATED.privacidad}`,
    `cookies:${LEGAL_LAST_UPDATED.cookies}`,
  ].join("|");
}

export function formatLegalDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
