import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, { error: "El título debe tener al menos 3 caracteres" }).trim(),
  description: z.string().min(10, { error: "La descripción debe tener al menos 10 caracteres" }).trim(),
  price: z.number().min(0, { error: "El precio no puede ser negativo" }),
  thumbnailUrl: z.url({ error: "URL de imagen inválida" }).optional().or(z.literal("")),
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
