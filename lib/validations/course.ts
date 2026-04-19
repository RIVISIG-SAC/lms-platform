import { z } from "zod";

export const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type CourseLevelValue = (typeof COURSE_LEVELS)[number];

export const COURSE_LEVEL_LABELS: Record<CourseLevelValue, string> = {
  BEGINNER: "Básico",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

export const courseSchema = z.object({
  title: z.string().min(3, { error: "El título debe tener al menos 3 caracteres" }).trim(),
  description: z.string().min(10, { error: "La descripción debe tener al menos 10 caracteres" }).trim(),
  price: z.number().min(0, { error: "El precio no puede ser negativo" }),
  thumbnailUrl: z.url({ error: "URL de imagen inválida" }).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  level: z.enum(COURSE_LEVELS).optional().or(z.literal("")),
  durationHours: z
    .number({ error: "Duración inválida" })
    .int({ error: "Usa un número entero" })
    .min(0, { error: "Duración no puede ser negativa" })
    .max(2000, { error: "Duración demasiado alta" })
    .optional(),
  published: z.boolean().optional(),
});

export const moduleSchema = z.object({
  title: z.string().min(2, { error: "El título debe tener al menos 2 caracteres" }).trim(),
  order: z.number().int().min(0),
});

export const chapterSchema = z.object({
  title: z.string().min(2, { error: "El título debe tener al menos 2 caracteres" }).trim(),
  content: z.string().optional(),
  vimeoVideoId: z.string().optional(),
  order: z.number().int().min(0),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
