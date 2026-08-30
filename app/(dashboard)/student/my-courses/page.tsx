import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth';
import { formatDate, cn } from '@/lib/utils';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  History,
  Layers,
  Play,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export const metadata = { title: 'Mis Cursos | Cursos Pro' };

const ESTADOS = {
  PAID: {
    label: 'En progreso',
    class: 'bg-primary/10 text-primary',
    icon: Clock,
  },
  COMPLETED: {
    label: 'Completado',
    class: 'bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  EXPIRED: {
    label: 'Expirado',
    class: 'bg-muted text-muted-foreground',
    icon: History,
  },
  FAILED: {
    label: 'No aprobado',
    class: 'bg-destructive/10 text-destructive',
    icon: AlertCircle,
  },
  PENDING: {
    label: 'Pendiente',
    class: 'bg-amber-50 text-amber-700',
    icon: Clock,
  },
} as const;

const DIAS_AVISO_VENCIMIENTO = 30;

function diasRestantes(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

type Props = {
  searchParams: Promise<{ evaluacion?: string; curso?: string }>;
};

export default async function StudentMyCoursesPage({ searchParams }: Props) {
  const session = await getRequiredSession();
  const { evaluacion, curso } = await searchParams;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId, status: { not: 'PENDING' } },
    orderBy: { startDate: 'desc' },
    include: {
      course: {
        include: { _count: { select: { modules: true } } },
      },
      certificate: { select: { verificationCode: true, status: true } },
    },
  });

  const reprobado =
    evaluacion === 'reprobada'
      ? (enrollments.find((e) => e.courseId === curso) ?? null)
      : null;

  const enProgreso = enrollments.filter((e) => e.status === 'PAID');
  const completados = enrollments.filter((e) => e.status === 'COMPLETED');
  const archivados = enrollments.filter(
    (e) => !['PAID', 'COMPLETED'].includes(e.status),
  );
  const certificados = enrollments.filter(
    (e) => e.certificate?.status === 'ACTIVE',
  ).length;

  const stats = [
    { icon: BookOpen, label: 'En progreso', value: enProgreso.length },
    { icon: CheckCircle2, label: 'Completados', value: completados.length },
    { icon: Award, label: 'Certificados', value: certificados },
  ];

  const grupos = [
    { titulo: 'En progreso', icon: Clock, items: enProgreso },
    { titulo: 'Completados', icon: CheckCircle2, items: completados },
    { titulo: 'Historial', icon: History, items: archivados },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Mi formación
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Mis cursos
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {enrollments.length}{' '}
            {enrollments.length === 1
              ? 'inscripción registrada'
              : 'inscripciones registradas'}{' '}
            en tu cuenta.
          </p>
        </div>
        <Link
          href="/cursos"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full justify-center gap-2 font-semibold md:w-auto',
          )}
        >
          <Compass className="size-4" />
          Explorar catálogo
        </Link>
      </div>

      {reprobado && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">
              No aprobaste la evaluación de {reprobado.course.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Agotaste tus 2 intentos, así que se retiró tu acceso al curso.
              Queda registrado en tu historial y puedes volver a inscribirte
              cuando quieras: tu progreso e intentos empezarán desde cero.
            </p>
            <Link
              href={`/cursos/${reprobado.courseId}`}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'mt-4 justify-center font-semibold',
              )}
            >
              Volver a inscribirme
            </Link>
          </div>
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center sm:p-14">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-foreground">
            Tu aula está vacía
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Aún no te has inscrito en ningún curso. Explora el catálogo y
            empieza tu formación.
          </p>
          <Link
            href="/cursos"
            className={cn(buttonVariants(), 'mt-6 justify-center font-bold')}
          >
            Ver catálogo de cursos
          </Link>
        </div>
      ) : (
        <>
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map(({ icon: Icon, label, value }) => (
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
              </div>
            ))}
          </div>

          {/* Grupos por estado */}
          {grupos.map(({ titulo, icon: GrupoIcon, items }) => (
            <section key={titulo}>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <GrupoIcon className="size-3.5" />
                {titulo}
                <span className="font-black text-foreground/50">
                  {items.length}
                </span>
              </h2>

              <div className="space-y-4">
                {items.map((enrollment) => {
                  const { course } = enrollment;
                  const estado =
                    ESTADOS[enrollment.status as keyof typeof ESTADOS] ??
                    ESTADOS.PENDING;
                  const EstadoIcon = estado.icon;
                  const activo = ['PAID', 'COMPLETED'].includes(
                    enrollment.status,
                  );
                  const progreso = Math.round(enrollment.progressPercentage);
                  const dias = diasRestantes(enrollment.endDate);
                  const porVencer =
                    activo && dias >= 0 && dias <= DIAS_AVISO_VENCIMIENTO;

                  return (
                    <div
                      key={enrollment.id}
                      className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/30"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-48 lg:w-56">
                          {course.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={course.thumbnailUrl}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                              <BookOpen className="size-8 text-primary/40" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-4 sm:p-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                                estado.class,
                              )}
                            >
                              <EstadoIcon className="size-3" />
                              {estado.label}
                            </span>
                            {enrollment.certificate?.status === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                <Award className="size-3" />
                                Certificado
                              </span>
                            )}
                            {enrollment.certificate?.status ===
                              'PENDING_PAYMENT' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                <Award className="size-3" />
                                Certificado pendiente
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2.5 text-base sm:text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                            {course.title}
                          </h3>

                          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Layers className="size-3.5" />
                              {course._count.modules}{' '}
                              {course._count.modules === 1
                                ? 'módulo'
                                : 'módulos'}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="size-3.5" />
                              Desde {formatDate(enrollment.startDate)}
                            </span>
                            {activo && (
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5',
                                  porVencer && 'font-semibold text-amber-700',
                                )}
                              >
                                <CalendarClock className="size-3.5" />
                                {porVencer
                                  ? `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}`
                                  : `Vence ${formatDate(enrollment.endDate)}`}
                              </span>
                            )}
                          </div>

                          {!activo && (
                            <p className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                              {enrollment.status === 'FAILED'
                                ? 'Agotaste los 2 intentos de la evaluación, por lo que ya no tienes acceso al curso. Queda en tu historial; si te vuelves a inscribir, tu progreso e intentos empiezan desde cero.'
                                : 'Tu acceso a este curso terminó. Queda en tu historial; si te vuelves a inscribir, tu progreso e intentos empiezan desde cero.'}
                            </p>
                          )}

                          {enrollment.status === 'PAID' && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <span>Progreso</span>
                                <span className="tabular-nums text-foreground">
                                  {progreso}%
                                </span>
                              </div>
                              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all duration-700"
                                  style={{
                                    width: `${Math.max(progreso, 2)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
                            {enrollment.certificate?.status === 'ACTIVE' && (
                              <a
                                href={`/api/certificates/${enrollment.certificate.verificationCode}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm',
                                  }),
                                  'w-full gap-2 font-semibold sm:w-auto',
                                )}
                              >
                                <Award className="size-4" />
                                Certificado
                              </a>
                            )}
                            {enrollment.certificate?.status ===
                              'PENDING_PAYMENT' && (
                              <Link
                                href={`/student/courses/${course.id}/exam`}
                                className={cn(
                                  buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm',
                                  }),
                                  'w-full gap-2 font-semibold sm:w-auto',
                                )}
                              >
                                <Award className="size-4" />
                                Pagar certificado
                              </Link>
                            )}

                            {activo ? (
                              <Link
                                href={`/student/courses/${course.id}`}
                                className={cn(
                                  buttonVariants({ size: 'sm' }),
                                  'w-full justify-center gap-2 font-semibold sm:w-auto',
                                )}
                              >
                                {enrollment.status === 'COMPLETED' ? (
                                  <>
                                    <CheckCircle2 className="size-4" />
                                    Repasar
                                  </>
                                ) : (
                                  <>
                                    <Play className="size-4 fill-current" />
                                    {progreso > 0 ? 'Continuar' : 'Iniciar'}
                                  </>
                                )}
                              </Link>
                            ) : (
                              <Link
                                href={`/cursos/${course.id}`}
                                className={cn(
                                  buttonVariants({
                                    variant: 'outline',
                                    size: 'sm',
                                  }),
                                  'w-full justify-center font-semibold sm:w-auto',
                                )}
                              >
                                Volver a inscribirme
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
