"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { courseSchema, moduleSchema, chapterSchema } from "@/lib/validations/course";

// ─── Courses ────────────────────────────────────────────────────────────────

export async function createCourse(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    published: false,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const course = await prisma.course.create({ data: parsed.data });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    published: formData.get("published") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.course.update({ where: { id }, data: parsed.data });
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
