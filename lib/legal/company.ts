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

export const LEGAL_LAST_UPDATED = {
  terminos: "2026-05-15",
  privacidad: "2026-05-15",
} as const;

export function getLegalAcceptanceVersion(): string {
  return `tyc:${LEGAL_LAST_UPDATED.terminos}|priv:${LEGAL_LAST_UPDATED.privacidad}`;
}

export function formatLegalDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
