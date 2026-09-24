import { z } from "zod";

/**
 * Hoja de reclamación, compartida entre el formulario público y la server
 * action. Los campos siguen el Anexo I del Reglamento del Libro de
 * Reclamaciones (D.S. 011-2011-PCM).
 */

/** Plazo legal de respuesta (D.S. 101-2022-PCM): improrrogable. */
export const COMPLAINT_RESPONSE_BUSINESS_DAYS = 15;

export const COMPLAINT_DETAIL_MAX = 3000;
export const COMPLAINT_RESPONSE_MAX = 5000;

export const COMPLAINT_TYPES = ["RECLAMO", "QUEJA"] as const;
export type ComplaintTypeValue = (typeof COMPLAINT_TYPES)[number];

export const COMPLAINT_TYPE_LABELS: Record<ComplaintTypeValue, string> = {
  RECLAMO: "Reclamo",
  QUEJA: "Queja",
};

/** Definiciones que el Reglamento obliga a mostrar junto a cada opción. */
export const COMPLAINT_TYPE_HINTS: Record<ComplaintTypeValue, string> = {
  RECLAMO: "Disconformidad relacionada con los productos o servicios.",
  QUEJA:
    "Disconformidad no relacionada con los productos o servicios, o malestar o descontento respecto a la atención al público.",
};

export const COMPLAINT_DOCUMENT_TYPES = ["DNI", "CE", "PASAPORTE", "RUC"] as const;
export type ComplaintDocumentTypeValue = (typeof COMPLAINT_DOCUMENT_TYPES)[number];

export const COMPLAINT_DOCUMENT_LABELS: Record<ComplaintDocumentTypeValue, string> = {
  DNI: "DNI",
  CE: "Carné de extranjería",
  PASAPORTE: "Pasaporte",
  RUC: "RUC",
};

export const COMPLAINT_ITEM_TYPES = ["PRODUCTO", "SERVICIO"] as const;

export const COMPLAINT_STATUS_LABELS = {
  PENDING: "Pendiente",
  ANSWERED: "Respondida",
} as const;

const DOCUMENT_PATTERNS: Record<ComplaintDocumentTypeValue, RegExp> = {
  DNI: /^\d{8}$/,
  CE: /^[A-Za-z0-9]{8,12}$/,
  PASAPORTE: /^[A-Za-z0-9]{6,12}$/,
  RUC: /^(10|15|17|20)\d{9}$/,
};

const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label}: mínimo ${min} caracteres`)
    .max(max, `${label}: máximo ${max} caracteres`);

export const complaintSchema = z
  .object({
    consumerName: text("Nombre", 3, 150),
    documentType: z.enum(COMPLAINT_DOCUMENT_TYPES, {
      error: "Selecciona el tipo de documento",
    }),
    documentNumber: z.string().trim().toUpperCase(),
    address: text("Domicilio", 5, 250),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s-]{6,20}$/, "Ingresa un teléfono válido"),
    email: z.email("Ingresa un correo válido").trim().toLowerCase().max(150),
    isMinor: z.boolean(),
    guardianName: z.string().trim().max(150).optional(),

    itemType: z.enum(COMPLAINT_ITEM_TYPES, {
      error: "Indica si es un producto o un servicio",
    }),
    amount: z
      .string()
      .trim()
      .regex(/^(\d{1,8}(\.\d{1,2})?)?$/, "Monto inválido (ej. 150.00)")
      .optional(),
    itemDescription: text("Descripción del bien", 3, 500),

    type: z.enum(COMPLAINT_TYPES, { error: "Elige reclamo o queja" }),
    detail: text("Detalle", 10, COMPLAINT_DETAIL_MAX),
    request: text("Pedido", 5, COMPLAINT_DETAIL_MAX),

    acceptTerms: z.literal(true, {
      error: "Debes confirmar que la información es verdadera",
    }),
  })
  .superRefine((data, ctx) => {
    if (!DOCUMENT_PATTERNS[data.documentType].test(data.documentNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["documentNumber"],
        message: `Número de ${COMPLAINT_DOCUMENT_LABELS[data.documentType]} inválido`,
      });
    }
    if (data.isMinor && (data.guardianName ?? "").length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["guardianName"],
        message: "Indica el nombre del padre, madre o apoderado",
      });
    }
  });

export type ComplaintInput = z.infer<typeof complaintSchema>;

export const complaintResponseSchema = z.object({
  complaintId: z.string().min(1),
  response: text("Respuesta", 10, COMPLAINT_RESPONSE_MAX),
});

/** `LR-2026-000123`: el año es el de registro, el número es el correlativo global. */
export function formatComplaintCode(number: number, createdAt: Date): string {
  return `LR-${createdAt.getFullYear()}-${String(number).padStart(6, "0")}`;
}

/**
 * Fecha límite de respuesta: suma días hábiles (lunes a viernes). No descuenta
 * feriados, así que el plazo real puede ser un poco mayor; el panel lo usa solo
 * para priorizar, no como cómputo legal.
 */
export function complaintDeadline(createdAt: Date): Date {
  const date = new Date(createdAt);
  let added = 0;
  while (added < COMPLAINT_RESPONSE_BUSINESS_DAYS) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date;
}
