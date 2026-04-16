import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { CourseCard } from "@/components/courses/CourseCard";

export const metadata = { title: "Catálogo de Cursos | Cursos Pro" };

export default async function StudentCatalogPage() {
  const session = await getRequiredSession();

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { modules: true } } },
    }),
    prisma.enrollment.findMany({
      where: { userId: session.userId },
      select: { courseId: true, status: true },
    }),
  ]);

  const enrolledMap = new Map(enrollments.map((e) => [e.courseId, e.status]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Catálogo de Cursos
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          {courses.length} {courses.length === 1 ? "curso disponible" : "cursos disponibles"}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12 text-center">
          <p className="text-[var(--muted-foreground)]">
            No hay cursos disponibles en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const enrollStatus = enrolledMap.get(course.id);
            const isActive = enrollStatus === "PAID" || enrollStatus === "COMPLETED";

            return (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                price={course.price}
                thumbnailUrl={course.thumbnailUrl}
                moduleCount={course._count.modules}
                href={`/student/catalog/${course.id}`}
                badge={
                  isActive ? (
                    <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                      Inscrito
                    </span>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
