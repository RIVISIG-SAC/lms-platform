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

  return {
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    category: rawCategory,
    level: rawLevel,
    durationHours,
  };
}

function buildCourseData(parsed: ReturnType<typeof courseSchema.safeParse> & { success: true }) {
  const { category, level, durationHours, thumbnailUrl, ...rest } = parsed.data;
  return {
    ...rest,
    thumbnailUrl: thumbnailUrl && thumbnailUrl !== "" ? thumbnailUrl : null,
    category: category && category !== "" ? category : null,
    level: level ? (level as CourseLevel) : null,
    durationHours: typeof durationHours === "number" ? durationHours : null,
  };
}

export async function createCourse(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const parsed = courseSchema.safeParse({
    ...parseCoursePayload(formData),
    published: false,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const course = await prisma.course.create({ data: buildCourseData(parsed) });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const parsed = courseSchema.safeParse({
    ...parseCoursePayload(formData),
    published: formData.get("published") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.course.update({ where: { id }, data: buildCourseData(parsed) });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

// ─── Modules ────────────────────────────────────────────────────────────────

export async function createModule(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const courseId = formData.get("courseId") as string;
  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.module.create({ data: { ...parsed.data, courseId } });
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function updateModule(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const courseId = formData.get("courseId") as string;
  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.module.update({ where: { id }, data: parsed.data });
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function deleteModule(moduleId: string, courseId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── Chapters ───────────────────────────────────────────────────────────────

export async function createChapter(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const moduleId = formData.get("moduleId") as string;
  const courseId = formData.get("courseId") as string;
  const parsed = chapterSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    vimeoVideoId: formData.get("vimeoVideoId") || undefined,
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.chapter.create({ data: { ...parsed.data, moduleId } });
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function updateChapter(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const courseId = formData.get("courseId") as string;
  const parsed = chapterSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    vimeoVideoId: formData.get("vimeoVideoId") || undefined,
    order: Number(formData.get("order")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.chapter.update({ where: { id }, data: parsed.data });
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function deleteChapter(chapterId: string, courseId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.chapter.delete({ where: { id: chapterId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── Chapter Resources ───────────────────────────────────────────────────────

export async function createResource(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const chapterId = formData.get("chapterId") as string;
  const courseId = formData.get("courseId") as string;
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
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function deleteResource(resourceId: string, courseId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.chapterResource.delete({ where: { id: resourceId } });
  revalidatePath(`/admin/courses/${courseId}`);
}
