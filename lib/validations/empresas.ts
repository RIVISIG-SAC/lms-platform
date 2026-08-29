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

export const companySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
      .max(140, { error: "Máximo 140 caracteres" }),
    slug: z
      .string()
      .trim()
      .regex(slugRegex, { error: "Slug inválido (solo minúsculas, números y guiones)" })
      .max(160, { error: "Slug demasiado largo" }),
    sector: z.string().trim().max(120).optional().or(z.literal("")),
    logoUrl: z.url({ error: "URL de logo inválida" }).optional().or(z.literal("")),

    status: z.enum(POST_STATUSES),
    publishedAt: z.coerce.date().optional().nullable(),

    heroTitle: z
      .string()
      .trim()
      .min(5, { error: "El título debe tener al menos 5 caracteres" })
      .max(200, { error: "Máximo 200 caracteres" }),
    heroHighlight: z.string().trim().max(120).optional().or(z.literal("")),
    heroSubtitle: z.string().trim().max(400).optional().or(z.literal("")),
    heroImageUrl: z.url({ error: "URL de imagen inválida" }).optional().or(z.literal("")),

    aboutContent: z
      .string()
      .min(50, { error: "El contenido debe tener al menos 50 caracteres" }),
    fullAddress: z.string().trim().max(240).optional().or(z.literal("")),

    challengeText: z.string().trim().max(2000).optional().or(z.literal("")),
    challengeImageUrl: z.url().optional().or(z.literal("")),
    leadershipText: z.string().trim().max(2000).optional().or(z.literal("")),
    leadershipImageUrl: z.url().optional().or(z.literal("")),
    teamworkText: z.string().trim().max(2000).optional().or(z.literal("")),
    teamworkImageUrl: z.url().optional().or(z.literal("")),

    testimonialVimeoId: z
      .string()
      .trim()
      .regex(/^\d+$/, { error: "Solo el ID numérico del video de Vimeo" })
      .optional()
      .or(z.literal("")),
    testimonialQuote: z.string().trim().max(600).optional().or(z.literal("")),
    testimonialAuthorName: z.string().trim().max(120).optional().or(z.literal("")),
    testimonialAuthorRole: z.string().trim().max(120).optional().or(z.literal("")),

    fichaLocation: z.string().trim().max(120).optional().or(z.literal("")),
    fichaClientName: z.string().trim().max(200).optional().or(z.literal("")),
    fichaRuc: z.string().trim().max(20).optional().or(z.literal("")),
    fichaProjectScope: z.string().trim().max(400).optional().or(z.literal("")),
    fichaCertificationYear: z.string().trim().max(20).optional().or(z.literal("")),
    fichaProjectStatus: z.string().trim().max(120).optional().or(z.literal("")),
    fichaAccompaniment: z.string().trim().max(200).optional().or(z.literal("")),

    closingMessage: z.string().trim().max(1000).optional().or(z.literal("")),
    closingImageUrl: z.url().optional().or(z.literal("")),

    seoTitle: z.string().trim().max(60, { error: "Máximo 60 caracteres" }).optional().or(z.literal("")),
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
        message: "Debes definir fecha de publicación para programar la empresa",
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

export const companyFactSchema = z.object({
  icon: z.string().trim().min(1, { error: "Selecciona un ícono" }),
  label: z.string().trim().min(1, { error: "El texto es obligatorio" }).max(80),
  value: z.string().trim().max(160).optional().or(z.literal("")),
});

export const companyServiceSchema = z.object({
  title: z.string().trim().min(1, { error: "El título es obligatorio" }).max(120),
  description: z.string().trim().max(400).optional().or(z.literal("")),
});

export const companyAchievementSchema = z.object({
  text: z.string().trim().min(1, { error: "El texto es obligatorio" }).max(300),
});

export const companyAwardSchema = z.object({
  title: z.string().trim().min(1, { error: "El título es obligatorio" }).max(160),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  imageUrl: z.url().optional().or(z.literal("")),
});

export const companyCertificationSchema = z.object({
  standard: z.string().trim().min(1, { error: "La norma es obligatoria" }).max(80),
  label: z.string().trim().min(1, { error: "La etiqueta es obligatoria" }).max(80),
  icon: z.string().trim().max(60).optional().or(z.literal("")),
});

export const companyImageItemSchema = z.object({
  url: z.url({ error: "URL de imagen inválida" }),
  alt: z.string().trim().max(160).optional().or(z.literal("")),
  caption: z.string().trim().max(200).optional().or(z.literal("")),
});

export type CompanyInput = z.infer<typeof companySchema>;
export type CompanyFactInput = z.infer<typeof companyFactSchema>;
export type CompanyServiceInput = z.infer<typeof companyServiceSchema>;
export type CompanyAchievementInput = z.infer<typeof companyAchievementSchema>;
export type CompanyAwardInput = z.infer<typeof companyAwardSchema>;
export type CompanyCertificationInput = z.infer<typeof companyCertificationSchema>;
export type CompanyImageItemInput = z.infer<typeof companyImageItemSchema>;
