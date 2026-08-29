"use server";

import { z } from "zod";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import {
  companySchema,
  companyFactSchema,
  companyServiceSchema,
  companyAchievementSchema,
  companyAwardSchema,
  companyCertificationSchema,
  companyImageItemSchema,
  POST_STATUSES,
  type CompanyInput,
  type PostStatusValue,
} from "@/lib/validations/empresas";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize";
import { ensureUniqueCompanySlug } from "@/lib/empresas/slug";
import { checkRateLimit } from "@/lib/security/rateLimit";

type ActionResult<T = unknown> = { success: true; data?: T } | { error: string };

async function requireAdmin() {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

function revalidateCompany(slug?: string) {
  revalidatePath("/admin/empresas");
  revalidatePath("/empresas");
  if (slug) revalidatePath(`/empresas/${slug}`);
  updateTag("companies");
}

function parseCompanyPayload(formData: FormData) {
  const get = (name: string) => ((formData.get(name) as string) || "").trim();

  const rawPublishedAt = formData.get("publishedAt");
  const publishedAt =
    typeof rawPublishedAt === "string" && rawPublishedAt.length ? new Date(rawPublishedAt) : null;

  const statusRaw = (formData.get("status") as string) || "DRAFT";
  const status = (POST_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as PostStatusValue)
    : "DRAFT";

  return {
    name: get("name"),
    slug: get("slug"),
    sector: get("sector"),
    logoUrl: get("logoUrl"),
    status,
    publishedAt,
    heroTitle: get("heroTitle"),
    heroHighlight: get("heroHighlight"),
    heroSubtitle: get("heroSubtitle"),
    heroImageUrl: get("heroImageUrl"),
    aboutContent: (formData.get("aboutContent") as string) || "",
    fullAddress: get("fullAddress"),
    challengeText: get("challengeText"),
    challengeImageUrl: get("challengeImageUrl"),
    leadershipText: get("leadershipText"),
    leadershipImageUrl: get("leadershipImageUrl"),
    teamworkText: get("teamworkText"),
    teamworkImageUrl: get("teamworkImageUrl"),
    testimonialVimeoId: get("testimonialVimeoId"),
    testimonialQuote: get("testimonialQuote"),
    testimonialAuthorName: get("testimonialAuthorName"),
    testimonialAuthorRole: get("testimonialAuthorRole"),
    fichaLocation: get("fichaLocation"),
    fichaClientName: get("fichaClientName"),
    fichaRuc: get("fichaRuc"),
    fichaProjectScope: get("fichaProjectScope"),
    fichaCertificationYear: get("fichaCertificationYear"),
    fichaProjectStatus: get("fichaProjectStatus"),
    fichaAccompaniment: get("fichaAccompaniment"),
    closingMessage: get("closingMessage"),
    closingImageUrl: get("closingImageUrl"),
    seoTitle: get("seoTitle"),
    seoDescription: get("seoDescription"),
    ogImageUrl: get("ogImageUrl"),
    canonicalUrl: get("canonicalUrl"),
    noIndex: formData.get("noIndex") === "true" || formData.get("noIndex") === "on",
  };
}

function parseListField<T>(formData: FormData, name: string, schema: z.ZodType<T>): T[] {
  const raw = formData.get(name);
  if (typeof raw !== "string" || !raw.trim()) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  // Valida cada ítem por separado: una fila inválida no debe descartar el resto de la lista.
  return data.reduce<T[]>((acc, item) => {
    const parsed = schema.safeParse(item);
    if (parsed.success) acc.push(parsed.data);
    return acc;
  }, []);
}

function buildCompanyData(data: CompanyInput, sanitizedAbout: string) {
  return {
    name: data.name,
    slug: data.slug,
    sector: data.sector || null,
    logoUrl: data.logoUrl || null,
    status: data.status,
    publishedAt: data.publishedAt ?? null,
    heroTitle: data.heroTitle,
    heroHighlight: data.heroHighlight || null,
    heroSubtitle: data.heroSubtitle || null,
    heroImageUrl: data.heroImageUrl || null,
    aboutContent: sanitizedAbout,
    fullAddress: data.fullAddress || null,
    challengeText: data.challengeText || null,
    challengeImageUrl: data.challengeImageUrl || null,
    leadershipText: data.leadershipText || null,
    leadershipImageUrl: data.leadershipImageUrl || null,
    teamworkText: data.teamworkText || null,
    teamworkImageUrl: data.teamworkImageUrl || null,
    testimonialVimeoId: data.testimonialVimeoId || null,
    testimonialQuote: data.testimonialQuote || null,
    testimonialAuthorName: data.testimonialAuthorName || null,
    testimonialAuthorRole: data.testimonialAuthorRole || null,
    fichaLocation: data.fichaLocation || null,
    fichaClientName: data.fichaClientName || null,
    fichaRuc: data.fichaRuc || null,
    fichaProjectScope: data.fichaProjectScope || null,
    fichaCertificationYear: data.fichaCertificationYear || null,
    fichaProjectStatus: data.fichaProjectStatus || null,
    fichaAccompaniment: data.fichaAccompaniment || null,
    closingMessage: data.closingMessage || null,
    closingImageUrl: data.closingImageUrl || null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    ogImageUrl: data.ogImageUrl || null,
    canonicalUrl: data.canonicalUrl || null,
    noIndex: data.noIndex ?? false,
  };
}

function readChildLists(formData: FormData) {
  const aboutImages = parseListField(formData, "aboutImages", companyImageItemSchema);
  const galleryImages = parseListField(formData, "galleryImages", companyImageItemSchema);

  return {
    facts: parseListField(formData, "facts", companyFactSchema),
    services: parseListField(formData, "services", companyServiceSchema),
    achievements: parseListField(formData, "achievements", companyAchievementSchema),
    awards: parseListField(formData, "awards", companyAwardSchema),
    certifications: parseListField(formData, "certifications", companyCertificationSchema),
    images: [
      ...aboutImages.map((img) => ({ ...img, section: "ABOUT" as const })),
      ...galleryImages.map((img) => ({ ...img, section: "GALLERY" as const })),
    ],
  };
}

function childCreateInput(lists: ReturnType<typeof readChildLists>) {
  return {
    facts: { create: lists.facts.map((f, order) => ({ ...f, value: f.value || null, order })) },
    services: { create: lists.services.map((s, order) => ({ ...s, description: s.description || null, order })) },
    achievements: { create: lists.achievements.map((a, order) => ({ ...a, order })) },
    awards: {
      create: lists.awards.map((a, order) => ({
        ...a,
        description: a.description || null,
        imageUrl: a.imageUrl || null,
        order,
      })),
    },
    certifications: {
      create: lists.certifications.map((c, order) => ({ ...c, icon: c.icon || null, order })),
    },
    images: {
      create: lists.images.map((i, order) => ({ ...i, alt: i.alt || "", caption: i.caption || null, order })),
    },
  };
}

// ─── Companies ──────────────────────────────────────────────────────────────

export async function createCompany(_prev: unknown, formData: FormData): Promise<ActionResult> {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const limit = checkRateLimit(session.userId, "empresas:mutation");
  if (!limit.allowed) {
    return { error: `Demasiadas operaciones. Intenta de nuevo en ${limit.retryInSeconds}s.` };
  }

  const payload = parseCompanyPayload(formData);

  const slug = payload.slug
    ? await ensureUniqueCompanySlug(payload.slug)
    : await ensureUniqueCompanySlug(payload.name);

  const parsed = companySchema.safeParse({ ...payload, slug });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const sanitizedAbout = sanitizeBlogHtml(parsed.data.aboutContent);
  const lists = readChildLists(formData);

  const company = await prisma.company.create({
    data: {
      ...buildCompanyData(parsed.data, sanitizedAbout),
      ...childCreateInput(lists),
    },
  });

  revalidateCompany(company.slug);
  redirect(`/admin/empresas/${company.id}/edit`);
}

export async function updateCompany(_prev: unknown, formData: FormData): Promise<ActionResult> {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const id = (formData.get("id") as string) || "";
  if (!id) return { error: "ID requerido" };

  const limit = checkRateLimit(session.userId, "empresas:mutation");
  if (!limit.allowed) {
    return { error: `Demasiadas operaciones. Intenta de nuevo en ${limit.retryInSeconds}s.` };
  }

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return { error: "Empresa no encontrada" };

  const payload = parseCompanyPayload(formData);

  let slug = payload.slug || existing.slug;
  if (slug !== existing.slug) {
    slug = await ensureUniqueCompanySlug(slug, id);
  }

  const parsed = companySchema.safeParse({ ...payload, slug });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const sanitizedAbout = sanitizeBlogHtml(parsed.data.aboutContent);
  const lists = readChildLists(formData);

  await prisma.$transaction([
    prisma.companyFact.deleteMany({ where: { companyId: id } }),
    prisma.companyService.deleteMany({ where: { companyId: id } }),
    prisma.companyAchievement.deleteMany({ where: { companyId: id } }),
    prisma.companyAward.deleteMany({ where: { companyId: id } }),
    prisma.companyCertification.deleteMany({ where: { companyId: id } }),
    prisma.companyImage.deleteMany({ where: { companyId: id } }),
    prisma.company.update({
      where: { id },
      data: {
        ...buildCompanyData(parsed.data, sanitizedAbout),
        ...childCreateInput(lists),
      },
    }),
  ]);

  revalidateCompany(existing.slug);
  revalidateCompany(parsed.data.slug);
  return { success: true };
}

export async function deleteCompany(companyId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { slug: true } });
  if (!company) return { error: "Empresa no encontrada" };

  await prisma.company.delete({ where: { id: companyId } });
  revalidateCompany(company.slug);
  return { success: true };
}

export async function duplicateCompany(companyId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const original = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      facts: true,
      services: true,
      achievements: true,
      awards: true,
      certifications: true,
      images: true,
    },
  });
  if (!original) return { error: "Empresa no encontrada" };

  const newSlug = await ensureUniqueCompanySlug(`${original.slug}-copia`);

  await prisma.company.create({
    data: {
      name: `${original.name} (copia)`,
      slug: newSlug,
      sector: original.sector,
      logoUrl: original.logoUrl,
      status: "DRAFT",
      publishedAt: null,
      heroTitle: original.heroTitle,
      heroHighlight: original.heroHighlight,
      heroSubtitle: original.heroSubtitle,
      heroImageUrl: original.heroImageUrl,
      aboutContent: original.aboutContent,
      fullAddress: original.fullAddress,
      challengeText: original.challengeText,
      challengeImageUrl: original.challengeImageUrl,
      leadershipText: original.leadershipText,
      leadershipImageUrl: original.leadershipImageUrl,
      teamworkText: original.teamworkText,
      teamworkImageUrl: original.teamworkImageUrl,
      testimonialVimeoId: original.testimonialVimeoId,
      testimonialQuote: original.testimonialQuote,
      testimonialAuthorName: original.testimonialAuthorName,
      testimonialAuthorRole: original.testimonialAuthorRole,
      fichaLocation: original.fichaLocation,
      fichaClientName: original.fichaClientName,
      fichaRuc: original.fichaRuc,
      fichaProjectScope: original.fichaProjectScope,
      fichaCertificationYear: original.fichaCertificationYear,
      fichaProjectStatus: original.fichaProjectStatus,
      fichaAccompaniment: original.fichaAccompaniment,
      closingMessage: original.closingMessage,
      closingImageUrl: original.closingImageUrl,
      seoTitle: original.seoTitle,
      seoDescription: original.seoDescription,
      ogImageUrl: original.ogImageUrl,
      canonicalUrl: null,
      noIndex: original.noIndex,
      facts: { create: original.facts.map(({ icon, label, value, order }) => ({ icon, label, value, order })) },
      services: {
        create: original.services.map(({ title, description, order }) => ({ title, description, order })),
      },
      achievements: { create: original.achievements.map(({ text, order }) => ({ text, order })) },
      awards: {
        create: original.awards.map(({ title, description, imageUrl, order }) => ({
          title,
          description,
          imageUrl,
          order,
        })),
      },
      certifications: {
        create: original.certifications.map(({ standard, label, icon, order }) => ({
          standard,
          label,
          icon,
          order,
        })),
      },
      images: {
        create: original.images.map(({ section, url, alt, caption, order }) => ({
          section,
          url,
          alt,
          caption,
          order,
        })),
      },
    },
  });

  revalidateCompany();
  return { success: true };
}
