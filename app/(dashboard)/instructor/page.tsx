import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Award,
  BookOpen,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FileEdit,
  GraduationCap,
  PlusCircle,
  TrendingUp,
  UserCircle,
  Users,
} from 'lucide-react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Dashboard | Instructor' };

function formatFecha(date: Date) {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
}

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function InstructorDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      courses: {
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          published: true,
          _count: { select: { enrollments: true, modules: true } },
        },
      },
    },
  });

  const courses = profile?.courses ?? [];
  const courseIds = courses.map((c) => c.id);
  const publicados = courses.filter((c) => c.published);
  const borradores = courses.filter((c) => !c.published);

  const [enrollments, certificados, recientes] = courseIds.length
    ? await Promise.all([
        prisma.enrollment.findMany({
          where: { courseId: { in: courseIds }, status: { in: ['PAID', 'COMPLETED'] } },
          select: { progressPercentage: true, status: true },
        }),
        prisma.certificate.count({
          where: { courseId: { in: courseIds }, status: 'ACTIVE' },
        }),
        prisma.enrollment.findMany({
          where: { courseId: { in: courseIds }, status: { in: ['PAID', 'COMPLETED'] } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            progressPercentage: true,
            user: { select: { name: true } },
            course: { select: { id: true, title: true } },
          },
        }),
      ])
    : [[], 0, []];

  const completados = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const progresoPromedio = enrollments.length
    ? Math.round(
        enrollments.reduce((acc, e) => acc + e.progressPercentage, 0) /
          enrollments.length,
      )
    : 0;

  // Campos del perfil público que conviene tener completos
  const camposPerfil = [
    { label: 'Foto', ok: Boolean(profile?.avatarUrl) },
    { label: 'Título o cargo', ok: Boolean(profile?.title) },
    { label: 'Especialización', ok: Boolean(profile?.specialization) },
    { label: 'Biografía', ok: Boolean(profile?.bio) },
  ];
  const perfilCompleto = camposPerfil.filter((c) => c.ok).length;

  const stats = [
    {
      icon: BookOpen,
      label: 'Cursos',
      value: courses.length,
      suffix: `${publicados.length} publicados`,
    },
    {
      icon: Users,
      label: 'Estudiantes',
      value: enrollments.length,
      suffix: 'inscripciones activas',
    },
    {
      icon: Award,
      label: 'Certificados',
      value: certificados,
      suffix: 'emitidos',
    },
    {
      icon: TrendingUp,
      label: 'Progreso',
      value: `${progresoPromedio}%`,
      suffix: 'promedio del alumnado',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Panel del instructor
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Hola, {session.name.split(' ')[0]}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Consulta cómo avanzan tus cursos, quién se ha inscrito y mantén al
            día tu perfil público.
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

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, suffix }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
            <p className="mt-3 text-3xl font-black tabular-nums tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {suffix}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          {/* Mis cursos */}
          {courses.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <h2 className="text-base font-bold text-foreground">
                  Mis cursos
                </h2>
                <Link
                  href="/instructor/courses"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ver todos
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {courses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={`/instructor/courses/${course.id}`}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
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
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate text-sm font-bold text-foreground">
                          {course.title}
                        </p>
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            course.published
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700',
                          )}
                        >
                          {course.published ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {course._count.enrollments}{' '}
                        {course._count.enrollments === 1
                          ? 'estudiante'
                          : 'estudiantes'}{' '}
                        · {course._count.modules}{' '}
                        {course._count.modules === 1 ? 'módulo' : 'módulos'}
                      </p>
                    </div>

                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="size-6" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-foreground">
                Aún no tienes cursos
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Crea tu primer curso, añade sus módulos y publícalo cuando esté
                listo para los estudiantes.
              </p>
              <Link
                href="/instructor/courses/new"
                className={cn(buttonVariants(), 'mt-6 justify-center font-bold')}
              >
                Crear mi primer curso
              </Link>
            </div>
          )}

          {/* Últimas inscripciones */}
          {recientes.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-base font-bold text-foreground">
                  Últimas inscripciones
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Estudiantes que se sumaron recientemente a tus cursos.
                </p>
              </div>
              <ul className="divide-y divide-border">
                {recientes.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-black text-primary">
                      {iniciales(e.user.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {e.user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.course.title}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold tabular-nums text-foreground">
                        {Math.round(e.progressPercentage)}%
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFecha(e.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Perfil público */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCircle className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-foreground">
                  Tu perfil público
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Es lo que ven los estudiantes en tus cursos y en la web.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Completado</span>
                <span className="tabular-nums text-foreground">
                  {perfilCompleto} de {camposPerfil.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    perfilCompleto === camposPerfil.length
                      ? 'bg-emerald-500'
                      : 'bg-primary',
                  )}
                  style={{
                    width: `${(perfilCompleto / camposPerfil.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {perfilCompleto < camposPerfil.length && (
              <ul className="mt-4 space-y-1.5">
                {camposPerfil
                  .filter((c) => !c.ok)
                  .map((c) => (
                    <li
                      key={c.label}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <CircleAlert className="size-3.5 shrink-0 text-amber-600" />
                      Falta {c.label.toLowerCase()}
                    </li>
                  ))}
              </ul>
            )}

            <div className="mt-5 space-y-2">
              <Link
                href="/instructor/profile"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full justify-center gap-2 font-semibold',
                )}
              >
                <FileEdit className="size-4" />
                Editar perfil
              </Link>
              {profile && (
                <Link
                  href={`/instructores/${profile.id}`}
                  target="_blank"
                  className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ExternalLink className="size-3.5" />
                  Ver página pública
                </Link>
              )}
            </div>
          </div>

          {/* Estado de los cursos */}
          {courses.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-bold text-foreground">
                Estado de tus cursos
              </h2>
              <dl className="mt-4 space-y-3">
                {[
                  {
                    icon: BookOpen,
                    label: 'Publicados',
                    value: publicados.length,
                  },
                  {
                    icon: FileEdit,
                    label: 'En borrador',
                    value: borradores.length,
                  },
                  {
                    icon: GraduationCap,
                    label: 'Alumnos que completaron',
                    value: completados,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="size-3.5 text-muted-foreground" />
                      {label}
                    </dt>
                    <dd className="text-sm font-bold tabular-nums text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {borradores.length > 0 && (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800">
                  Tienes {borradores.length}{' '}
                  {borradores.length === 1 ? 'curso' : 'cursos'} sin publicar.
                  Los estudiantes no pueden verlos hasta que los publiques.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
