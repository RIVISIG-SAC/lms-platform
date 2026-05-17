"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import {
  blogPostSchema,
  blogCategorySchema,
  blogTagSchema,
  POST_STATUSES,
  type PostStatusValue,
} from "@/lib/validations/blog";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize";
import {
  ensureUniqueBlogCategorySlug,
  ensureUniqueBlogPostSlug,
  ensureUniqueBlogTagSlug,
} from "@/lib/blog/slug";
import { checkRateLimit } from "@/lib/security/rateLimit";

type ActionResult<T = unknown> = { success: true; data?: T } | { error: string };

async function requireAdmin() {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

function revalidateBlog(slug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  updateTag("blog-posts");
}

function parsePostPayload(formData: FormData) {
  const tagIdsRaw = formData.get("tagIds");
  const tagIds = typeof tagIdsRaw === "string" && tagIdsRaw.length
    ? tagIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawPublishedAt = formData.get("publishedAt");
  const publishedAt =
    typeof rawPublishedAt === "string" && rawPublishedAt.length ? new Date(rawPublishedAt) : null;

  const rawCategoryId = (formData.get("categoryId") as string | null) || "";
  const categoryId = rawCategoryId.length ? rawCategoryId : null;

  const statusRaw = (formData.get("status") as string) || "DRAFT";
  const status = (POST_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as PostStatusValue)
    : "DRAFT";

  return {
    title: ((formData.get("title") as string) || "").trim(),
    slug: ((formData.get("slug") as string) || "").trim(),
    excerpt: ((formData.get("excerpt") as string) || "").trim(),
    content: (formData.get("content") as string) || "",
    coverImageUrl: ((formData.get("coverImageUrl") as string) || "").trim(),
    status,
    publishedAt,
    categoryId,
    tagIds,
    seoTitle: ((formData.get("seoTitle") as string) || "").trim(),
    seoDescription: ((formData.get("seoDescription") as string) || "").trim(),
    ogImageUrl: ((formData.get("ogImageUrl") as string) || "").trim(),
    canonicalUrl: ((formData.get("canonicalUrl") as string) || "").trim(),
    noIndex: formData.get("noIndex") === "true" || formData.get("noIndex") === "on",
  };
}

// ─── Posts ──────────────────────────────────────────────────────────────────

export async function createPost(_prev: unknown, formData: FormData): Promise<ActionResult> {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const limit = checkRateLimit(session.userId, "blog:mutation");
  if (!limit.allowed) {
    return { error: `Demasiadas operaciones. Intenta de nuevo en ${limit.retryInSeconds}s.` };
  }

  const payload = parsePostPayload(formData);

  let slug = payload.slug;
  if (!slug) {
    slug = await ensureUniqueBlogPostSlug(payload.title);
  } else {
    slug = await ensureUniqueBlogPostSlug(slug);
  }

  const parsed = blogPostSchema.safeParse({ ...payload, slug });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const sanitizedContent = sanitizeBlogHtml(parsed.data.content);

  const post = await prisma.blogPost.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content: sanitizedContent,
      coverImageUrl: parsed.data.coverImageUrl || null,
      status: parsed.data.status,
      publishedAt: parsed.data.publishedAt ?? null,
      authorId: session.userId,
      categoryId: parsed.data.categoryId,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      ogImageUrl: parsed.data.ogImageUrl || null,
      canonicalUrl: parsed.data.canonicalUrl || null,
      noIndex: parsed.data.noIndex ?? false,
      tags: {
        create: (parsed.data.tagIds ?? []).map((tagId) => ({ tagId })),
      },
    },
  });

  revalidateBlog(post.slug);
  redirect(`/admin/blog/${post.id}/edit`);
}

export async function updatePost(_prev: unknown, formData: FormData): Promise<ActionResult> {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const id = (formData.get("id") as string) || "";
  if (!id) return { error: "ID requerido" };

  const limit = checkRateLimit(session.userId, "blog:mutation");
  if (!limit.allowed) {
    return { error: `Demasiadas operaciones. Intenta de nuevo en ${limit.retryInSeconds}s.` };
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Post no encontrado" };

  const payload = parsePostPayload(formData);

  let slug = payload.slug || existing.slug;
  if (slug !== existing.slug) {
    slug = await ensureUniqueBlogPostSlug(slug, id);
  }

  const parsed = blogPostSchema.safeParse({ ...payload, slug });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const sanitizedContent = sanitizeBlogHtml(parsed.data.content);

  await prisma.$transaction([
    prisma.blogPostTag.deleteMany({ where: { postId: id } }),
    prisma.blogPost.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt || null,
        content: sanitizedContent,
        coverImageUrl: parsed.data.coverImageUrl || null,
        status: parsed.data.status,
        publishedAt: parsed.data.publishedAt ?? null,
        categoryId: parsed.data.categoryId,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        ogImageUrl: parsed.data.ogImageUrl || null,
        canonicalUrl: parsed.data.canonicalUrl || null,
        noIndex: parsed.data.noIndex ?? false,
        tags: {
          create: (parsed.data.tagIds ?? []).map((tagId) => ({ tagId })),
        },
      },
    }),
  ]);

  revalidateBlog(existing.slug);
  revalidateBlog(parsed.data.slug);
  return { success: true };
}

export async function deletePost(postId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const post = await prisma.blogPost.findUnique({ where: { id: postId }, select: { slug: true } });
  if (!post) return { error: "Post no encontrado" };

  await prisma.blogPost.delete({ where: { id: postId } });
  revalidateBlog(post.slug);
  return { success: true };
}

export async function duplicatePost(postId: string): Promise<ActionResult> {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const original = await prisma.blogPost.findUnique({
    where: { id: postId },
    include: { tags: { select: { tagId: true } } },
  });
  if (!original) return { error: "Post no encontrado" };

  const newSlug = await ensureUniqueBlogPostSlug(`${original.slug}-copia`);

  await prisma.blogPost.create({
    data: {
      title: `${original.title} (copia)`,
      slug: newSlug,
      excerpt: original.excerpt,
      content: original.content,
      coverImageUrl: original.coverImageUrl,
      status: "DRAFT",
      publishedAt: null,
      authorId: session.userId,
      categoryId: original.categoryId,
      seoTitle: original.seoTitle,
      seoDescription: original.seoDescription,
      ogImageUrl: original.ogImageUrl,
      canonicalUrl: null,
      noIndex: original.noIndex,
      tags: { create: original.tags.map((t) => ({ tagId: t.tagId })) },
    },
  });

  revalidateBlog();
  return { success: true };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function createCategory(_prev: unknown, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const name = ((formData.get("name") as string) || "").trim();
  const slugRaw = ((formData.get("slug") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();

  const slug = slugRaw || (await ensureUniqueBlogCategorySlug(name));

  const parsed = blogCategorySchema.safeParse({ name, slug, description });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const exists = await prisma.blogCategory.findFirst({
    where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }] },
  });
  if (exists) return { error: "Ya existe una categoría con ese nombre o slug" };

  await prisma.blogCategory.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/categories");
  updateTag("blog-categories");
  return { success: true };
}

export async function updateCategory(_prev: unknown, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const id = (formData.get("id") as string) || "";
  if (!id) return { error: "ID requerido" };

  const name = ((formData.get("name") as string) || "").trim();
  const slugRaw = ((formData.get("slug") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();

  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) return { error: "Categoría no encontrada" };

  const slug = slugRaw !== existing.slug ? await ensureUniqueBlogCategorySlug(slugRaw || name, id) : existing.slug;

  const parsed = blogCategorySchema.safeParse({ name, slug, description });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.blogCategory.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog");
  updateTag("blog-categories");
  updateTag("blog-posts");
  return { success: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  await prisma.blogCategory.delete({ where: { id: categoryId } });

  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog");
  updateTag("blog-categories");
  updateTag("blog-posts");
  return { success: true };
}

// ─── Tags ───────────────────────────────────────────────────────────────────

export async function createTag(rawName: string): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const name = rawName.trim();
  const parsed = blogTagSchema.safeParse({ name });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nombre inválido" };

  const existing = await prisma.blogTag.findFirst({
    where: { name: { equals: parsed.data.name, mode: "insensitive" } },
  });
  if (existing) {
    return { success: true, data: { id: existing.id, name: existing.name, slug: existing.slug } };
  }

  const slug = await ensureUniqueBlogTagSlug(parsed.data.name);
  const created = await prisma.blogTag.create({
    data: { name: parsed.data.name, slug },
    select: { id: true, name: true, slug: true },
  });

  updateTag("blog-tags");
  return { success: true, data: created };
}

export async function deleteTag(tagId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  await prisma.blogTag.delete({ where: { id: tagId } });
  updateTag("blog-tags");
  updateTag("blog-posts");
  return { success: true };
}
