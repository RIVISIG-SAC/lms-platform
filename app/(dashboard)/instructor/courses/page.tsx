import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BookOpen,
  ChevronRight,
  FileEdit,
  Layers,
  PlusCircle,
  Users,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

export const metadata = { title: 'Mis Cursos | Instructor' };

type CursoItem = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  published: boolean;
  price: Parameters<typeof formatCurrency>[0];
  isFree: boolean;
  updatedAt: Date;
  _count: { enrollments: number; modules: number };
};

function formatFecha(date: Date) {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function TarjetaCurso({ course }: { course: CursoItem }) {
  const sinContenido = course._count.modules === 0;

  return (
    <Link
      href={`/instructor/courses/${course.id}`}
      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-primary/5 text-primary/40">
            <BookOpen className="size-5" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">
          {course.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {course._count.enrollments}{' '}
            {course._count.enrollments === 1 ? 'estudiante' : 'estudiantes'}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1',
              sinContenido && 'font-semibold text-amber-700',
            )}
          >
            <Layers className="size-3.5" />
            {course._count.modules}{' '}
            {course._count.modules === 1 ? 'módulo' : 'módulos'}
          </span>
          <span className="font-semibold text-foreground">
            {course.isFree ? 'Gratuito' : formatCurrency(course.price)}
          </span>
          <span className="hidden sm:inline">
            Editado el {formatFecha(course.updatedAt)}
          </span>
        </div>
      </div>

      <span
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'hidden shrink-0 gap-1.5 font-semibold sm:inline-flex',
        )}
      >
        <FileEdit className="size-3.5" />
        Editar
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:hidden" />
    </Link>
  );
}

function Grupo({
  title,
  description,
  courses,
}: {
  title: string;
  description: string;
  courses: CursoItem[];
}) {
  if (courses.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-bold text-foreground">
          {title}{' '}
          <span className="text-sm font-semibold text-muted-foreground tabular-nums">
            ({courses.length})
          </span>
        </h2>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="divide-y divide-border">
          {courses.map((c) => (
            <TarjetaCurso key={c.id} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function InstructorCoursesPage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      courses: {
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { enrollments: true, modules: true } } },
      },
    },
  });

  const courses: CursoItem[] = profile?.courses ?? [];
  const publicados = courses.filter((c) => c.published);
  const borradores = courses.filter((c) => !c.published);
  const totalEstudiantes = courses.reduce(
    (acc, c) => acc + c._count.enrollments,
    0,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Enseñanza
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Mis cursos
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Gestiona el contenido, los módulos y la publicación de los cursos
            que tienes asignados.
          </p>
        </div>
        <Link
          href="/instructor/courses/new"
          className={cn(
            buttonVariants(),
            'w-full justify-center gap-2 font-semibold md:w-auto',
          )}
        >
          <PlusCircle className="size-4" />
          Nuevo curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-foreground">
            Aún no tienes cursos
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Crea tu primer curso, organiza sus módulos y publícalo cuando esté
            listo para los estudiantes.
          </p>
          <Link
            href="/instructor/courses/new"
            className={cn(buttonVariants(), 'mt-6 justify-center font-bold')}
          >
            Crear mi primer curso
          </Link>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Publicados', value: publicados.length },
              { label: 'En borrador', value: borradores.length },
              { label: 'Estudiantes', value: totalEstudiantes },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                  {value}
                </p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <Grupo
              title="Publicados"
              description="Visibles en el catálogo y abiertos a inscripciones."
              courses={publicados}
            />
            <Grupo
              title="Borradores"
              description="Solo tú puedes verlos. Publícalos cuando el contenido esté listo."
              courses={borradores}
            />
          </div>
        </>
      )}
    </div>
  );
}
