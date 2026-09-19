/** Límites del formulario "Contactar tutor", compartidos entre UI y servidor. */
export const SUPPORT_SUBJECT_MIN = 3;
export const SUPPORT_SUBJECT_MAX = 150;
export const SUPPORT_MESSAGE_MIN = 10;
export const SUPPORT_MESSAGE_MAX = 2000;

export const SUPPORT_STATUSES = ["OPEN", "ANSWERED", "CLOSED"] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  OPEN: "Pendiente",
  ANSWERED: "Respondida",
  CLOSED: "Cerrada",
};
