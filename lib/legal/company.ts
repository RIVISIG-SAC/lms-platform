export const LEGAL_COMPANY = {
  razonSocial: "RIVISIG CONSULTORES S.A.C.",
  marca: "RIVISIG Consultores",
  ruc: "20614925621",

  /**
   * Dirección del establecimiento. INDECOPI la pide en la hoja de reclamación;
   * mientras sea `null` no se muestra ni en la página ni en la constancia.
   */
  direccion: null as string | null,
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

/** Horario de los canales de atención que cita la política de devoluciones. */
export const ATTENTION_HOURS = [
  { dias: "Lunes a viernes", horario: "8:00 a. m. a 5:00 p. m." },
  { dias: "Sábados", horario: "8:00 a. m. a 1:00 p. m." },
  { dias: "Domingos y feriados", horario: "No laborables" },
] as const;

/** Plazos de la política de devoluciones. Cambiarlos obliga a subir `LEGAL_LAST_UPDATED.devoluciones`. */
export const REFUND_TERMS = {
  diasParaSolicitar: 7,
  horasHabilesRespuesta: 48,
  diasHabilesGestion: 5,
} as const;

export const LEGAL_LAST_UPDATED = {
  terminos: "2026-09-24",
  privacidad: "2026-09-19",
  cookies: "2026-09-19",
  devoluciones: "2026-09-24",
  reclamaciones: "2026-09-24",
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
