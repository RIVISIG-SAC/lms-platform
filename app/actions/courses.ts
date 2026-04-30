"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { courseSchema, moduleSchema, chapterSchema } from "@/lib/validations/course";
import type { CourseLevel } from "@prisma/client";

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

  return {
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    isFree,
    certificateFee,
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    category: rawCategory,
    level: rawLevel,
    durationHours,
    instructorId: rawInstructorId || null,
  };
}

function buildCourseData(
  parsed: ReturnType<typeof courseSchema.safeParse> & { success: true },
  instructorId: string | null,
) {
  const { category, level, durationHours, thumbnailUrl, certificateFee, ...rest } = parsed.data;
  return {
    ...rest,
    thumbnailUrl: thumbnailUrl && thumbnailUrl !== "" ? thumbnailUrl : null,
    category: category && category !== "" ? category : null,
    level: level ? (level as CourseLevel) : null,
    durationHours: typeof durationHours === "number" ? durationHours : null,
    certificateFee: typeof certificateFee === "number" ? certificateFee : null,
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
  const parsed = courseSchema.safeParse({ ...payload, published: false });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const course = await prisma.course.create({ data: buildCourseData(parsed, instructorId) });

  if (session.role === "INSTRUCTOR") {
    revalidatePath("/instructor/courses");
    redirect(`/instructor/courses/${course.id}`);
  }
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

async function assertCourseAccess(courseId: string) {
  const session = await getRequiredSession();
  if (session.role === "ADMIN") return session;
  if (session.role === "INSTRUCTOR") {
    const profile = await prisma.instructorProfile.findUnique({ where: { userId: session.userId } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!profile || course?.instructorId !== profile.id) throw new Error("No autorizado");
    return session;
  }
  throw new Error("No autorizado");
}

export async function updateCourse(_prev: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try { session = await assertCourseAccess(id); } catch { return { error: "No autorizado" }; }

  const payload = parseCoursePayload(formData);
  const instructorId = session.role === "INSTRUCTOR"
    ? (await prisma.instructorProfile.findUnique({ where: { userId: session.userId } }))?.id ?? null
    : payload.instructorId;
  const parsed = courseSchema.safeParse({
    ...payload,
    published: formData.get("published") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.course.update({ where: { id }, data: buildCourseData(parsed, instructorId ?? null) });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  revalidatePath("/instructor/courses");
  revalidatePath(`/instructor/courses/${id}`);
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const session = await getRequiredSession();
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/admin/courses");
  revalidatePath("/instructor/courses");
  if (session.role === "INSTRUCTOR") redirect("/instructor/courses");
  redirect("/admin/courses");
}

// ─── Modules ────────────────────────────────────────────────────────────────

function revalidateCourse(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/instructor/courses/${courseId}`);
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
  revalidateCourse(courseId);
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
  revalidateCourse(courseId);
  return { success: true };
}

export async function deleteModule(moduleId: string, courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  await prisma.module.delete({ where: { id: moduleId } });
  revalidateCourse(courseId);
}

// ─── Chapters ───────────────────────────────────────────────────────────────

export async function createChapter(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const moduleId = formData.get("moduleId") as string;
  const parsed = chapterSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    vimeoVideoId: formData.get("vimeoVideoId") || undefined,
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.chapter.create({ data: { ...parsed.data, moduleId } });
  revalidateCourse(courseId);
  return { success: true };
}

export async function updateChapter(_prev: unknown, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  const id = formData.get("id") as string;
  const parsed = chapterSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    vimeoVideoId: formData.get("vimeoVideoId") || undefined,
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.chapter.update({ where: { id }, data: parsed.data });
  revalidateCourse(courseId);
  return { success: true };
}

export async function deleteChapter(chapterId: string, courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  await prisma.chapter.delete({ where: { id: chapterId } });
  revalidateCourse(courseId);
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
  revalidateCourse(courseId);
  return { success: true };
}

export async function deleteResource(resourceId: string, courseId: string) {
  try { await assertCourseAccess(courseId); } catch { return { error: "No autorizado" }; }

  await prisma.chapterResource.delete({ where: { id: resourceId } });
  revalidateCourse(courseId);
}
