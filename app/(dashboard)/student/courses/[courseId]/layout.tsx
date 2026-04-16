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
      {/* Top bar */}
      <header className="h-12 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/student/my-courses"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            title="Volver a mis cursos"
          >
            ← Mis Cursos
          </Link>
          <span className="text-[var(--border)]">|</span>
          <h1 className="text-sm font-medium text-[var(--foreground)] truncate max-w-xs">
            {course.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {enrollment.status === "COMPLETED" && (
            <Link
              href={`/student/courses/${courseId}/exam`}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:opacity-90"
            >
              Ir a Evaluación
            </Link>
          )}
          <span className="text-xs text-[var(--muted-foreground)] hidden sm:block">
            {Math.round(enrollment.progressPercentage)}% completado
          </span>
        </div>
      </header>

      {/* Content area — children includes the sidebar */}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
