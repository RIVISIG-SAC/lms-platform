import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

/**
 * Permite editar un curso al administrador y al instructor propietario.
 * Lanza si la sesión no tiene acceso, para que quien llama devuelva el error.
 */
export async function assertCourseAccess(courseId: string) {
  const session = await getRequiredSession();
  if (session.role === "ADMIN") return session;

  if (session.role === "INSTRUCTOR") {
    const [profile, course] = await Promise.all([
      prisma.instructorProfile.findUnique({ where: { userId: session.userId } }),
      prisma.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true },
      }),
    ]);
    if (!profile || course?.instructorId !== profile.id) {
      throw new Error("No autorizado");
    }
    return session;
  }

  throw new Error("No autorizado");
}

/** Refresca el curso en los dos paneles que pueden editarlo. */
export function revalidateCourseEditors(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/instructor/courses/${courseId}`);
}
