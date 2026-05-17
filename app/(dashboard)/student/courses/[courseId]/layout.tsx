import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

export default async function CoursePlayerLayout(props: {
  children: React.ReactNode;
  params: Promise<unknown>;
}) {
  const { children, params } = props;
  const { courseId } = (await params) as { courseId: string };
  const session = await getRequiredSession();

  const [course, enrollment] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true } }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
    }),
  ]);

  if (!course) notFound();

  if (!enrollment || !["PAID", "COMPLETED"].includes(enrollment.status)) {
    redirect(`/student/catalog/${courseId}`);
  }

  if (enrollment.endDate < new Date()) {
    redirect(`/student/catalog/${courseId}?expired=1`);
  }

  return (
    <div className="flex flex-col h-screen -m-6 bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)] flex-shrink-0">
        <div className="h-12 px-3 sm:px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/student/my-courses"
              className="text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0"
              title="Volver a mis cursos"
            >
              ← Mis Cursos
            </Link>
            <span className="text-[var(--border)]">|</span>
            <h1 className="text-sm font-medium text-[var(--foreground)] truncate">
              {course.title}
            </h1>
          </div>

          {enrollment.status === "COMPLETED" && (
            <Link
              href={`/student/courses/${courseId}/exam`}
              className="hidden sm:inline-flex text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:opacity-90"
            >
              Ir a Evaluacion
            </Link>
          )}
        </div>

        <div className="sm:hidden px-3 pb-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
            {Math.round(enrollment.progressPercentage)}% completado
          </span>
          {enrollment.status === "COMPLETED" && (
            <Link
              href={`/student/courses/${courseId}/exam`}
              className="text-[11px] bg-green-600 text-white px-2.5 py-1 rounded-md hover:opacity-90"
            >
              Ir a Evaluacion
            </Link>
          )}
        </div>
      </header>

      {/* Content area — children includes the sidebar */}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
