import { z } from "zod";

export const manualCertificateSchema = z.object({
  certificateTitle: z
    .string()
    .trim()
    .min(3, { error: "El título debe tener al menos 3 caracteres" })
    .max(160, { error: "Máximo 160 caracteres" }),
  holderName: z
    .string()
    .trim()
    .min(3, { error: "El nombre debe tener al menos 3 caracteres" })
    .max(120, { error: "Máximo 120 caracteres" }),
  holderDni: z
    .string()
    .trim()
    .regex(/^\d{6,12}$/, { error: "DNI debe tener entre 6 y 12 dígitos" })
    .optional()
    .or(z.literal("")),
  holderCompany: z
    .string()
    .trim()
    .max(100, { error: "Máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  customDescription: z
    .string()
    .trim()
    .max(400, { error: "Máximo 400 caracteres" })
    .optional()
    .or(z.literal("")),
  certificateValidityDays: z
    .preprocess((value) => {
      if (value == null || value === "") return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : value;
    }, z.number({ error: "Días de validez inválidos" }).int().min(1, { error: "La validez mínima es 1 día" }).max(3650, { error: "La validez máxima es 10 años" }).optional()),
});

export type ManualCertificateInput = z.infer<typeof manualCertificateSchema>;
