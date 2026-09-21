"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import {
  assertCourseAccess,
  revalidateCourseEditors,
} from "@/lib/courseAccess";
import { courseSchema, moduleSchema, chapterSchema } from "@/lib/validations/course";
import { ensureUniqueCourseSlug } from "@/lib/courses/slug";
import type { CourseLevel } from "@prisma/client";

/**
 * Invalida el catalogo publico. El tag "courses" cubre las entradas cacheadas
 * (home, /cursos y sitemap): sin el, revalidar solo "/cursos" dejaba la portada
 * sirviendo su snapshot hasta que expirara el revalidate.
 */
/** El path publico va por slug, asi que hay que resolverlo desde el courseId. */
async function revalidatePublicCourseById(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });
  revalidatePublicCourses(course?.slug);
}

function revalidatePublicCourses(...slugs: Array<string | null | undefined>) {
  updateTag("courses");
  revalidatePath("/");
  revalidatePath("/cursos");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/cursos/${slug}`);
  }
}

// ─── Courses ────────────────────────────────────────────────────────────────

function parseCoursePayload(formData: FormData) {
  const rawDuration = formData.get("durationHours");
  const durationHours =
    rawDuration === null || rawDuration === "" ? undefined : Number(rawDuration);
  const rawLevel = (formData.get("level") as string) || "";
  const rawCategory = ((formData.get("category") as string) || "").trim();
  const isFree = formData.get("isFree") === "true";
  const rawCertFee = formData.get("certificateFee");
  const certificateFee =
    rawCertFee === null || rawCertFee === "" ? undefined : Number(rawCertFee);
  const rawInstructorId = (formData.get("instructorId") as string | null) || "";
  const rawValidity = formData.get("certificateValidityDays");
  const certificateValidityDays =
    rawValidity === null || rawValidity === "" ? undefined : Number(rawValidity);
  const rawCertDescription = ((formData.get("certificateDescription") as string) || "").trim();

  return {
    title: formData.get("title"),
    slug: ((formData.get("slug") as string) || "").trim(),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    isFree,
    certificateFee,
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    previewVimeoId: ((formData.get("previewVimeoId") as string) || "").trim(),
    category: rawCategory,
    level: rawLevel,
    durationHours,
    certificateValidityDays,
    certificateDescription: rawCertDescription,
    instructorId: rawInstructorId || null,
  };
}

function buildCourseData(
  parsed: ReturnType<typeof courseSchema.safeParse> & { success: true },
  instructorId: string | null,
) {
  const { category, level, durationHours, thumbnailUrl, previewVimeoId, certificateFee, certificateValidityDays, certificateDescription, ...rest } = parsed.data;
  return {
    ...rest,
    thumbnailUrl: thumbnailUrl && thumbnailUrl !== "" ? thumbnailUrl : null,
    previewVimeoId: previewVimeoId && previewVimeoId !== "" ? previewVimeoId : null,
    category: category && category !== "" ? category : null,
    level: level ? (level as CourseLevel) : null,
    durationHours: typeof durationHours === "number" ? durationHours : null,
    certificateFee: typeof certificateFee === "number" ? certificateFee : null,
    certificateValidityDays: typeof certificateValidityDays === "number" ? certificateValidityDays : null,
    certificateDescription: certificateDescription && certificateDescription !== "" ? certificateDescription : null,
    instructorId: instructorId || null,
  };
}

export async function createCourse(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN" && session.role !== "INSTRUCTOR") return { error: "No autorizado" };

  let instructorId = parseCoursePayload(formData).instructorId;

  if (session.role === "INSTRUCTOR") {
    const profile = await prisma.instructorProfile.findUnique({ where: { userId: session.userId } });
    if (!profile) return { error: "Perfil de instructor no encontrado." };
    instructorId = profile.id;
  }

  const payload = parseCoursePayload(formData);
  // Si el admin no toca el campo, el slug sale del titulo.
  const slug = await ensureUniqueCourseSlug(
    payload.slug || String(payload.title ?? ""),
  );
  const parsed = courseSchema.safeParse({ ...payload, slug, published: false });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const course = await prisma.course.create({ data: buildCourseData(parsed, instructorId) });

  if (session.role === "INSTRUCTOR") {
    revalidatePath("/instructor/courses");
    redirect(`/instructor/courses/${course.id}`);
  }
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(_prev: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try { session = await assertCourseAccess(id); } catch { return { error: "No autorizado" }; }

  const payload = parseCoursePayload(formData);
  const instructorId = session.role === "INSTRUCTOR"
    ? (await prisma.instructorProfile.findUnique({ where: { userId: session.userId } }))?.id ?? null
    : payload.instructorId;

  const existing = await prisma.course.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return { error: "Curso no encontrado" };

  const requested = payload.slug || String(payload.title ?? "");
  const slug =
    requested === existing.slug
      ? existing.slug
      : await ensureUniqueCourseSlug(requested, id);

  const parsed = courseSchema.safeParse({
    ...payload,
    slug,
    published: formData.get("published") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.course.update({ where: { id }, data: buildCourseData(parsed, instructorId ?? null) });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  revalidatePath("/instructor/courses");
  revalidatePath(`/instructor/courses/${id}`);
  revalidatePublicCourses(existing.slug, slug);
  return { success: true, slug };
}

export async function deleteCourse(courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const enrollmentCount = await prisma.enrollment.count({ where: { courseId } });
  if (enrollmentCount > 0) {
    return { error: `No se puede eliminar un curso con ${enrollmentCount} estudiante(s) inscrito(s).` };
  }

  const session = await getRequiredSession();
  const deleted = await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/admin/courses");
  revalidatePath("/instructor/courses");
  revalidatePublicCourses(deleted.slug);
  if (session.role === "INSTRUCTOR") redirect("/instructor/courses");
  redirect("/admin/courses");
}

// ─── Modules ────────────────────────────────────────────────────────────────

/** Publica o despublica el curso desde la cabecera del editor. */
export async function setCoursePublished(courseId: string, published: boolean) {
  try {
    await assertCourseAccess(courseId);
  } catch {
    return { error: "No autorizado" };
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: { published },
    select: { slug: true },
  });

  revalidateCourseEditors(courseId);
  revalidatePath("/admin/courses");
  revalidatePath("/instructor/courses");
  revalidatePublicCourses(course.slug);
  return { success: true };
}

export async function createModule(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.module.create({ data: { ...parsed.data, courseId } });
  revalidateCourseEditors(courseId);
  return { success: true };
}

export async function updateModule(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const id = formData.get("id") as string;
  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.module.update({ where: { id }, data: parsed.data });
  revalidateCourseEditors(courseId);
  return { success: true };
}

export async function deleteModule(moduleId: string, courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  await prisma.module.delete({ where: { id: moduleId } });
  revalidateCourseEditors(courseId);
}

// ─── Chapters ───────────────────────────────────────────────────────────────

export async function createChapter(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const moduleId = formData.get("moduleId") as string;
  const parsed = chapterSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    vimeoVideoId: ((formData.get("vimeoVideoId") as string) || "").trim(),
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  // "" significa "sin video": hay que guardarlo como null, no como cadena vacía.
  await prisma.chapter.create({
    data: { ...parsed.data, vimeoVideoId: parsed.data.vimeoVideoId || null, moduleId },
  });
  revalidateCourseEditors(courseId);
  return { success: true };
}

export async function updateChapter(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const id = formData.get("id") as string;
  const parsed = chapterSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    vimeoVideoId: ((formData.get("vimeoVideoId") as string) || "").trim(),
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.chapter.update({
    where: { id },
    data: { ...parsed.data, vimeoVideoId: parsed.data.vimeoVideoId || null },
  });
  revalidateCourseEditors(courseId);
  return { success: true };
}

export async function deleteChapter(chapterId: string, courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  await prisma.chapter.delete({ where: { id: chapterId } });
  revalidateCourseEditors(courseId);
}

// ─── Chapter Resources ───────────────────────────────────────────────────────

export async function createResource(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const chapterId = formData.get("chapterId") as string;
  const name = (formData.get("name") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  const type = (formData.get("type") as string) || "PDF";

  if (!name) return { error: "El nombre es requerido" };
  if (!url) return { error: "La URL es requerida" };

  try {
    new URL(url);
  } catch {
    return { error: "URL inválida" };
  }

  await prisma.chapterResource.create({ data: { chapterId, name, url, type } });
  revalidateCourseEditors(courseId);
  return { success: true };
}

export async function deleteResource(resourceId: string, courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  await prisma.chapterResource.delete({ where: { id: resourceId } });
  revalidateCourseEditors(courseId);
}

// ─── Course FAQs ────────────────────────────────────────────────────────────

function parseFaqPayload(formData: FormData) {
  const question = ((formData.get("question") as string) || "").trim();
  const answer = ((formData.get("answer") as string) || "").trim();
  const orderRaw = formData.get("order");
  const order = orderRaw === null || orderRaw === "" ? 0 : Number(orderRaw);
  return { question, answer, order };
}

function validateFaq(data: { question: string; answer: string }) {
  if (data.question.length < 3) return "La pregunta debe tener al menos 3 caracteres";
  if (data.question.length > 200) return "La pregunta es demasiado larga (máx. 200)";
  if (data.answer.length < 3) return "La respuesta debe tener al menos 3 caracteres";
  if (data.answer.length > 2000) return "La respuesta es demasiado larga (máx. 2000)";
  return null;
}

export async function createCourseFaq(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const payload = parseFaqPayload(formData);
  const error = validateFaq(payload);
  if (error) return { error };

  const lastOrder = await prisma.courseFaq.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.courseFaq.create({
    data: {
      courseId,
      question: payload.question,
      answer: payload.answer,
      order: lastOrder ? lastOrder.order + 1 : 0,
    },
  });

  revalidateCourseEditors(courseId);
  await revalidatePublicCourseById(courseId);
  return { success: true };
}

export async function updateCourseFaq(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const id = formData.get("id") as string;
  const payload = parseFaqPayload(formData);
  const error = validateFaq(payload);
  if (error) return { error };

  await prisma.courseFaq.update({
    where: { id },
    data: { question: payload.question, answer: payload.answer },
  });

  revalidateCourseEditors(courseId);
  await revalidatePublicCourseById(courseId);
  return { success: true };
}

export async function deleteCourseFaq(faqId: string, courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  await prisma.courseFaq.delete({ where: { id: faqId } });
  revalidateCourseEditors(courseId);
  await revalidatePublicCourseById(courseId);
}

export async function reorderCourseFaqs(courseId: string, orderedIds: string[]) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.courseFaq.update({ where: { id }, data: { order: index } }),
    ),
  );

  revalidateCourseEditors(courseId);
  await revalidatePublicCourseById(courseId);
  return { success: true };
}
