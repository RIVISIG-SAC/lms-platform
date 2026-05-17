import { z } from "zod";

export const POST_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const;
export type PostStatusValue = (typeof POST_STATUSES)[number];

export const POST_STATUS_LABELS: Record<PostStatusValue, string> = {
  DRAFT: "Borrador",
  SCHEDULED: "Programado",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, { error: "El título debe tener al menos 5 caracteres" })
      .max(140, { error: "Máximo 140 caracteres" }),
    slug: z
      .string()
      .trim()
      .regex(slugRegex, { error: "Slug inválido (solo minúsculas, números y guiones)" })
      .max(160, { error: "Slug demasiado largo" }),
    excerpt: z
      .string()
      .trim()
      .max(300, { error: "El resumen no puede superar 300 caracteres" })
      .optional()
      .or(z.literal("")),
    content: z
      .string()
      .min(50, { error: "El contenido debe tener al menos 50 caracteres" }),
    coverImageUrl: z.url({ error: "URL de portada inválida" }).optional().or(z.literal("")),
    status: z.enum(POST_STATUSES),
    publishedAt: z.coerce.date().optional().nullable(),
    categoryId: z.string().min(1).optional().nullable(),
    tagIds: z.array(z.string().min(1)).max(10, { error: "Máximo 10 etiquetas" }).optional().default([]),

    seoTitle: z
      .string()
      .trim()
      .max(60, { error: "Máximo 60 caracteres" })
      .optional()
      .or(z.literal("")),
    seoDescription: z
      .string()
      .trim()
      .max(160, { error: "Máximo 160 caracteres" })
      .optional()
      .or(z.literal("")),
    ogImageUrl: z.url({ error: "URL de OG image inválida" }).optional().or(z.literal("")),
    canonicalUrl: z.url({ error: "URL canónica inválida" }).optional().or(z.literal("")),
    noIndex: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.status === "SCHEDULED" && !data.publishedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes definir fecha de publicación para programar el post",
        path: ["publishedAt"],
      });
    }
    if (data.status === "PUBLISHED" && !data.publishedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Falta fecha de publicación",
        path: ["publishedAt"],
      });
    }
  });

export const blogCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
    .max(60, { error: "Máximo 60 caracteres" }),
  slug: z
    .string()
    .trim()
    .regex(slugRegex, { error: "Slug inválido" })
    .max(80, { error: "Slug demasiado largo" }),
  description: z
    .string()
    .trim()
    .max(200, { error: "Máximo 200 caracteres" })
    .optional()
    .or(z.literal("")),
});

export const blogTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
    .max(40, { error: "Máximo 40 caracteres" }),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;
export type BlogTagInput = z.infer<typeof blogTagSchema>;
