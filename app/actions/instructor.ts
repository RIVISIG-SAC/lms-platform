"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

export async function updateInstructorProfileAction(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "INSTRUCTOR" && session.role !== "ADMIN") {
    return { error: "No autorizado." };
  }

  // Anti-IDOR: un INSTRUCTOR sólo puede editar su propio perfil. El `userId`
  // del formulario se ignora para ese rol; sólo ADMIN puede actuar sobre otro.
  const userId =
    session.role === "ADMIN"
      ? (formData.get("userId") as string) || session.userId
      : session.userId;

  const bio = (formData.get("bio") as string)?.trim() || null;
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim() || null;
  const specialization = (formData.get("specialization") as string)?.trim() || null;
  const linkedin = (formData.get("linkedin") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;

  await prisma.instructorProfile.upsert({
    where: { userId },
    create: { userId, bio, avatarUrl, title, specialization, linkedin, website },
    update: { bio, avatarUrl, title, specialization, linkedin, website },
  });

  revalidatePath("/instructor/profile");

  const profile = await prisma.instructorProfile.findUnique({ where: { userId } });
  if (profile) revalidatePath(`/instructores/${profile.id}`);

  return { success: true };
}
