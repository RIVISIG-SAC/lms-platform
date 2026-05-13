import { z } from "zod";

export const manualCertificateSchema = z.object({
  courseId: z.string().min(1, { error: "Selecciona un curso" }),
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
});

export type ManualCertificateInput = z.infer<typeof manualCertificateSchema>;
