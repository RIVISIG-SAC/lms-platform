import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function CoursePlayerLayout(props: {
  children: React.ReactNode;
  params: Promise<unknown>;
}) {
  const { children, params } = props;
  const { courseId } = (await params) as { courseId: string };
  const session = await getRequiredSession();

  const [course, enrollment] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
    }),
  ]);

  if (!course) notFound();

  // Reprobó los 2 intentos: perdió el acceso, pero el curso sigue en su
  // historial. Lo llevamos a Mis cursos con un aviso, no al catálogo.
  if (enrollment?.status === 'FAILED') {
    redirect(`/student/my-courses?evaluacion=reprobada&curso=${courseId}`);
  }

  if (!enrollment || !['PAID', 'COMPLETED'].includes(enrollment.status)) {
    redirect(`/student/catalog/${courseId}`);
  }

  if (enrollment.endDate < new Date()) {
    redirect(`/student/catalog/${courseId}?expired=1`);
  }

  const progreso = Math.round(enrollment.progressPercentage);

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] -m-6 bg-background">
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/student/my-courses"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Volver a mis cursos"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Mis cursos</span>
            </Link>
            <span className="h-5 w-px shrink-0 bg-border" />
            <h1 className="truncate text-sm font-semibold text-foreground">
              {course.title}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2.5 md:flex">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted lg:w-32">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums text-foreground">
                {progreso}%
              </span>
            </div>

            {enrollment.status === 'COMPLETED' && (
              <Link
                href={`/student/courses/${courseId}/exam`}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'font-semibold shrink-0',
                )}
              >
                Ir a evaluación
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content area — children includes the sidebar */}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
