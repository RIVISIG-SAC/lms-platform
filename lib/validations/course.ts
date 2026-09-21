import { z } from "zod";
import { normalizeVimeoInput } from "@/lib/vimeo";

export const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const VALIDITY_OPTIONS = [
  { label: "3 meses", value: 90 },
  { label: "6 meses", value: 180 },
  { label: "1 año", value: 365 },
  { label: "2 años", value: 730 },
] as const;
export type CourseLevelValue = (typeof COURSE_LEVELS)[number];

export const COURSE_LEVEL_LABELS: Record<CourseLevelValue, string> = {
  BEGINNER: "Básico",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

/**
 * Campo de video de Vimeo: acepta el ID, la URL de la barra de direcciones, el
 * enlace de "Compartir" o el iframe de inserción, y guarda siempre el formato
 * canónico de `lib/vimeo.ts`. Vacío significa "sin video".
 */
const vimeoField = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const normalized = normalizeVimeoInput(value);
    if (normalized === null) {
      ctx.addIssue({
        code: "custom",
        message: "No reconocemos ese video: pega el enlace de Vimeo o su ID",
      });
      return z.NEVER;
    }
    return normalized;
  });

export const courseSchema = z
  .object({
    title: z.string().min(3, { error: "El título debe tener al menos 3 caracteres" }).trim(),
    slug: z
      .string()
      .trim()
      .min(3, { error: "El slug debe tener al menos 3 caracteres" })
      .max(120, { error: "El slug es demasiado largo" })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        error: "Usa solo minúsculas, números y guiones",
      }),
    description: z.string().min(10, { error: "La descripción debe tener al menos 10 caracteres" }).trim(),
    price: z.number().min(0, { error: "El precio no puede ser negativo" }),
    isFree: z.boolean().optional().default(false),
    certificateFee: z.number().min(1, { error: "El costo del certificado debe ser mayor a 0" }).optional(),
    thumbnailUrl: z.url({ error: "URL de imagen inválida" }).optional().or(z.literal("")),
    previewVimeoId: vimeoField.optional(),
    category: z.string().trim().max(80).optional().or(z.literal("")),
    level: z.enum(COURSE_LEVELS).optional().or(z.literal("")),
    durationHours: z
      .number({ error: "Duración inválida" })
      .int({ error: "Usa un número entero" })
      .min(0, { error: "Duración no puede ser negativa" })
      .max(2000, { error: "Duración demasiado alta" })
      .optional(),
    published: z.boolean().optional(),
    certificateValidityDays: z
      .number({ error: "Días de validez inválidos" })
      .int()
      .min(1, { error: "La validez mínima es 1 día" })
      .max(3650, { error: "La validez máxima es 10 años" })
      .optional(),
    certificateDescription: z
      .string()
      .trim()
      .max(400, { error: "Máximo 400 caracteres" })
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.isFree && (data.certificateFee == null || data.certificateFee <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Los cursos gratuitos requieren especificar el costo del certificado",
        path: ["certificateFee"],
      });
    }
  });

export const moduleSchema = z.object({
  title: z.string().min(2, { error: "El título debe tener al menos 2 caracteres" }).trim(),
  order: z.number().int().min(0),
});

export const chapterSchema = z.object({
  title: z.string().min(2, { error: "El título debe tener al menos 2 caracteres" }).trim(),
  content: z.string().optional(),
  vimeoVideoId: vimeoField.optional(),
  order: z.number().int().min(0),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
