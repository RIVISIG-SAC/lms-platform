import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  Award,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  PlayCircle,
  TrendingUp,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { SupportResourcesCard } from '@/components/student/SupportResourcesCard';

const DIAS_AVISO_VENCIMIENTO = 30;

function formatFecha(date: Date) {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function diasRestantes(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export default async function StudentHomePage() {
  const session = await getRequiredSession();

  const [enrollments, certificatesCount] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.userId, status: { in: ['PAID', 'COMPLETED'] } },
      orderBy: { updatedAt: 'desc' },
      include: {
        course: {
          select: { id: true, title: true, thumbnailUrl: true },
        },
      },
    }),
    prisma.certificate.count({
      where: { enrollment: { userId: session.userId }, status: 'ACTIVE' },
    }),
  ]);

  const activos = enrollments.filter((e) => e.status === 'PAID');
  const completados = enrollments.filter((e) => e.status === 'COMPLETED');
  const progresoPromedio = enrollments.length
    ? Math.round(
        enrollments.reduce((acc, e) => acc + e.progressPercentage, 0) /
          enrollments.length,
      )
    : 0;

  const actual = activos[0] ?? null;

  // Siguiente capítulo pendiente del curso en el que se quedó
  let siguienteCapitulo: { id: string; title: string } | null = null;
  let capitulosTotal = 0;
  let capitulosCompletados = 0;

  if (actual) {
    const [capitulos, progreso] = await Promise.all([
      prisma.chapter.findMany({
        where: { module: { courseId: actual.courseId } },
        orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
        select: { id: true, title: true },
      }),
      prisma.chapterProgress.findMany({
        where: { enrollmentId: actual.id },
        select: { chapterId: true },
      }),
    ]);

    const hechos = new Set(progreso.map((p) => p.chapterId));
    capitulosTotal = capitulos.length;
    capitulosCompletados = capitulos.filter((c) => hechos.has(c.id)).length;
    siguienteCapitulo = capitulos.find((c) => !hechos.has(c.id)) ?? null;
  }

  const porVencer = activos
    .filter((e) => {
      const dias = diasRestantes(e.endDate);
      return dias >= 0 && dias <= DIAS_AVISO_VENCIMIENTO;
    })
    .slice(0, 3);

  const stats = [
    {
      icon: BookOpen,
      label: 'Cursos activos',
      value: activos.length,
      suffix: 'en progreso',
    },
    {
      icon: CheckCircle2,
      label: 'Completados',
      value: completados.length,
      suffix: 'finalizados',
    },
    {
      icon: Award,
      label: 'Certificados',
      value: certificatesCount,
      suffix: 'disponibles',
    },
    {
      icon: TrendingUp,
      label: 'Progreso',
      value: `${progresoPromedio}%`,
      suffix: 'promedio',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Panel del estudiante
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Hola, {session.name.split(' ')[0]}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Revisa tu avance, continúa tus clases y gestiona tus certificados
            desde un solo lugar.
          </p>
        </div>
        <Link
          href="/cursos"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'group w-full justify-center gap-2 font-semibold md:w-auto',
          )}
        >
          <Compass className="size-4" />
          Explorar catálogo
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            <p className="mt-3 text-3xl font-black tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {suffix}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Continúa donde te quedaste */}
          {actual ? (
            <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-col sm:flex-row">
                <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-56 lg:w-64">
                  {actual.course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={actual.course.thumbnailUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                      <BookOpen className="size-8 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="size-10 text-white" />
                  </div>
                </div>

                <div className="flex-1 p-5 sm:p-6">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Clock3 className="size-3.5" />
                    Continúa donde te quedaste
                  </p>
                  <h2 className="mt-2 text-lg sm:text-xl font-bold leading-snug text-foreground">
                    {actual.course.title}
                  </h2>
                  {siguienteCapitulo && (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Siguiente:{' '}
                      <span className="font-medium text-foreground">
                        {siguienteCapitulo.title}
                      </span>
                    </p>
                  )}

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>
                        {capitulosTotal > 0
                          ? `${capitulosCompletados} de ${capitulosTotal} capítulos`
                          : 'Sin capítulos publicados'}
                      </span>
                      <span className="text-foreground tabular-nums">
                        {Math.round(actual.progressPercentage)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{
                          width: `${Math.max(actual.progressPercentage, 2)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CalendarClock className="size-3.5" />
                      Acceso hasta {formatFecha(actual.endDate)}
                    </span>
                    <Link
                      href={`/student/courses/${actual.courseId}`}
                      className={cn(
                        buttonVariants(),
                        'w-full justify-center font-bold sm:w-auto',
                      )}
                    >
                      Reanudar clase
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 sm:p-12 text-center">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="size-6" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-foreground">
                Aún no tienes cursos en progreso
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Explora el catálogo y matricúlate para empezar a avanzar en tu
                formación.
              </p>
              <Link
                href="/cursos"
                className={cn(
                  buttonVariants(),
                  'mt-6 justify-center font-bold',
                )}
              >
                Explorar catálogo
              </Link>
            </div>
          )}

          {/* Mis cursos */}
          {enrollments.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <h2 className="text-base font-bold text-foreground">
                  Mis cursos
                </h2>
                <Link
                  href="/student/my-courses"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ver todos
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {enrollments.slice(0, 4).map((e) => {
                  const pct = Math.round(e.progressPercentage);
                  return (
                    <Link
                      key={e.id}
                      href={`/student/courses/${e.courseId}`}
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {e.course.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={e.course.thumbnailUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/5">
                            <BookOpen className="size-5 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                            {e.course.title}
                          </p>
                          {e.status === 'COMPLETED' && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                              Completado
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                          <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Certificados */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Award className="size-4" />
              </span>
              <h2 className="text-base font-bold text-foreground">
                Certificados
              </h2>
            </div>
            {certificatesCount > 0 ? (
              <>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Tienes{' '}
                  <span className="font-semibold text-foreground">
                    {certificatesCount}
                  </span>{' '}
                  {certificatesCount === 1
                    ? 'certificado disponible'
                    : 'certificados disponibles'}{' '}
                  para descargar y verificar.
                </p>
                <Link
                  href="/student/certificates"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'mt-4 w-full justify-center font-semibold',
                  )}
                >
                  Ver certificados
                </Link>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Completa los capítulos de tu curso y aprueba el examen final
                para obtener tu certificado verificable.
              </p>
            )}
          </div>

          {/* Acceso por vencer */}
          {porVencer.length > 0 && (
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarClock className="size-4" />
                </span>
                <h2 className="text-base font-bold text-foreground">
                  Acceso por vencer
                </h2>
              </div>
              <ul className="mt-3 space-y-3">
                {porVencer.map((e) => (
                  <li key={e.id} className="text-sm">
                    <p className="font-medium leading-snug text-foreground">
                      {e.course.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {diasRestantes(e.endDate)} días restantes ·{' '}
                      {formatFecha(e.endDate)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SupportResourcesCard
            userEmail={session.email}
            userName={session.name}
          />
        </div>
      </div>
    </div>
  );
}
