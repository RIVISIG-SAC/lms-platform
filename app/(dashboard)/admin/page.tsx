import Link from "next/link";
import {
  Award,
  BookOpen,
  ClipboardList,
  Clock3,
  CircleDollarSign,
  FileQuestion,
  GraduationCap,
  LifeBuoy,
  Plus,
  TimerOff,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { TrendChart } from "@/components/admin/dashboard/TrendChart";
import {
  AttentionList,
  type AttentionItem,
} from "@/components/admin/dashboard/AttentionList";
import {
  PERIOD_KEYS,
  PERIOD_OPTIONS,
  buildDailySeries,
  formatSoles,
  getDelta,
  getPeriodRanges,
  type PeriodKey,
} from "@/lib/admin-dashboard";
import { getEnumParam, type SearchParamsRecord } from "@/lib/pagination";
import { APP_TIME_ZONE } from "@/lib/timezone";

export const metadata = { title: "Dashboard | Admin" };

/** Aviso con el que se marcan los accesos a punto de vencer. */
const DIAS_AVISO_VENCIMIENTO = 7;
/** A partir de aquí un borrador se considera olvidado. */
const DIAS_BORRADOR_ESTANCADO = 14;

/**
 * Ingresos estimados del periodo.
 *
 * No hay tabla de transacciones, así que la cifra se reconstruye desde el
 * catálogo: precio del curso por cada inscripción de pago, más la tarifa de
 * cada certificado que se pagó en el periodo. Es una estimación —un cambio de
 * precio posterior reescribe el pasado— y la tarjeta lo dice.
 */
async function calcularIngresos(range: { start: Date; end: Date }) {
  const [porCurso, certificadosPagados] = await Promise.all([
    prisma.enrollment.groupBy({
      by: ["courseId"],
      where: {
        createdAt: { gte: range.start, lte: range.end },
        status: { in: ["PAID", "COMPLETED"] },
        course: { isFree: false },
      },
      _count: { _all: true },
    }),
    prisma.certificate.findMany({
      where: { certificatePaidAt: { gte: range.start, lte: range.end } },
      select: {
        course: { select: { certificateFee: true } },
        enrollment: { select: { course: { select: { certificateFee: true } } } },
      },
    }),
  ]);

  if (porCurso.length === 0 && certificadosPagados.length === 0) return 0;

  const cursos = await prisma.course.findMany({
    where: { id: { in: porCurso.map((row) => row.courseId) } },
    select: { id: true, price: true },
  });
  const precios = new Map(cursos.map((c) => [c.id, Number(c.price)]));

  const porInscripciones = porCurso.reduce(
    (total, row) => total + (precios.get(row.courseId) ?? 0) * row._count._all,
    0,
  );

  const porCertificados = certificadosPagados.reduce((total, cert) => {
    const fee =
      cert.enrollment?.course.certificateFee ?? cert.course?.certificateFee;
    return total + Number(fee ?? 0);
  }, 0);

  return porInscripciones + porCertificados;
}

export default async function AdminDashboardPage(props: {
  searchParams?: Promise<unknown>;
}) {
  const sp = ((await props.searchParams) ?? {}) as SearchParamsRecord;
  const periodParam = getEnumParam(sp, "period", PERIOD_KEYS);
  const period: PeriodKey = periodParam === "all" ? "7d" : periodParam;

  const { current, previous } = getPeriodRanges(period);
  const ahora = new Date();
  const limiteVencimiento = new Date(
    ahora.getTime() + DIAS_AVISO_VENCIMIENTO * 86_400_000,
  );
  const limiteBorrador = new Date(
    ahora.getTime() - DIAS_BORRADOR_ESTANCADO * 86_400_000,
  );

  const [
    // Periodo actual
    inscripcionesPeriodo,
    inscripcionesSerie,
    completadasCohorte,
    certificadosPeriodo,
    ingresosPeriodo,
    // Periodo anterior, solo para las comparaciones
    inscripcionesPrevias,
    certificadosPrevios,
    ingresosPrevios,
    // Estado general del catálogo y la comunidad
    totalCursos,
    cursosPublicados,
    totalEstudiantes,
    // Cola operativa
    consultasAbiertas,
    certificadosPorPagar,
    cursosSinModulos,
    cursosSinEvaluacion,
    borradoresEstancados,
    accesosPorVencer,
    // Catálogo con más tracción en el periodo
    topCursos,
  ] = await Promise.all([
    prisma.enrollment.count({
      where: { createdAt: { gte: current.start, lte: current.end } },
    }),
    prisma.enrollment.findMany({
      where: { createdAt: { gte: current.start, lte: current.end } },
      select: { createdAt: true },
    }),
    // Misma cohorte en numerador y denominador: inscripciones creadas en el
    // periodo que YA están completadas. Antes se dividían dos conjuntos
    // distintos y la tasa podía pasar del 100%.
    prisma.enrollment.count({
      where: {
        createdAt: { gte: current.start, lte: current.end },
        status: "COMPLETED",
      },
    }),
    prisma.certificate.count({
      where: { issueDate: { gte: current.start, lte: current.end } },
    }),
    calcularIngresos(current),

    prisma.enrollment.count({
      where: { createdAt: { gte: previous.start, lte: previous.end } },
    }),
    prisma.certificate.count({
      where: { issueDate: { gte: previous.start, lte: previous.end } },
    }),
    calcularIngresos(previous),

    prisma.course.count(),
    prisma.course.count({ where: { published: true } }),
    prisma.user.count({ where: { role: "STUDENT" } }),

    prisma.supportMessage.count({ where: { status: "OPEN" } }),
    prisma.certificate.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.course.count({ where: { published: true, modules: { none: {} } } }),
    prisma.course.count({ where: { published: true, questions: { none: {} } } }),
    prisma.course.count({
      where: { published: false, createdAt: { lte: limiteBorrador } },
    }),
    prisma.enrollment.count({
      where: {
        status: "PAID",
        endDate: { gte: ahora, lte: limiteVencimiento },
      },
    }),

    prisma.enrollment.groupBy({
      by: ["courseId"],
      where: { createdAt: { gte: current.start, lte: current.end } },
      _count: { _all: true },
      orderBy: { _count: { courseId: "desc" } },
      take: 5,
    }),
  ]);

  const cursosDelTop = await prisma.course.findMany({
    where: { id: { in: topCursos.map((row) => row.courseId) } },
    select: { id: true, title: true, published: true, isFree: true },
  });
  const cursoPorId = new Map(cursosDelTop.map((c) => [c.id, c]));

  const tasaFinalizacion =
    inscripcionesPeriodo > 0
      ? Math.round((completadasCohorte / inscripcionesPeriodo) * 100)
      : 0;

  const serie = buildDailySeries(
    inscripcionesSerie.map((e) => e.createdAt),
    current,
  );

  const pendientes: AttentionItem[] = [
    {
      label: "Consultas sin responder",
      detail: "Estudiantes esperando respuesta en la bandeja de soporte",
      count: consultasAbiertas,
      icon: LifeBuoy,
      href: "/admin/support",
      severity: "alta",
    },
    {
      label: "Certificados sin pagar",
      detail: "Aprobaron el examen pero el certificado sigue pendiente de pago",
      count: certificadosPorPagar,
      icon: Award,
      href: "/admin/certificates?status=PENDING_PAYMENT",
      severity: "media",
    },
    {
      label: "Accesos por vencer",
      detail: `Inscripciones activas que caducan en menos de ${DIAS_AVISO_VENCIMIENTO} días`,
      count: accesosPorVencer,
      icon: TimerOff,
      href: "/admin/students",
      severity: "media",
    },
    {
      label: "Cursos publicados sin contenido",
      detail: "Están visibles en el catálogo pero no tienen módulos",
      count: cursosSinModulos,
      icon: ClipboardList,
      href: "/admin/courses?status=published",
      severity: "alta",
    },
    {
      label: "Cursos publicados sin evaluación",
      detail: "Sin examen, el alumno no puede obtener su certificado",
      count: cursosSinEvaluacion,
      icon: FileQuestion,
      href: "/admin/courses?status=published",
      severity: "alta",
    },
    {
      label: `Borradores de más de ${DIAS_BORRADOR_ESTANCADO} días`,
      detail: "Creados hace tiempo y todavía sin publicar",
      count: borradoresEstancados,
      icon: Clock3,
      href: "/admin/courses?status=draft",
      severity: "media",
    },
  ];

  const periodoActual = PERIOD_OPTIONS.find((o) => o.key === period);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Actividad de{" "}
            <strong className="font-semibold text-foreground">
              {periodoActual?.label.toLowerCase()}
            </strong>{" "}
            y pendientes operativos. Horario de Perú ({APP_TIME_ZONE}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Periodo de los indicadores">
            <ul className="flex items-center rounded-xl border border-border bg-card p-1">
              {PERIOD_OPTIONS.map((opt) => {
                const activo = period === opt.key;
                return (
                  <li key={opt.key}>
                    <Link
                      href={`/admin?period=${opt.key}`}
                      aria-current={activo ? "page" : undefined}
                      aria-label={opt.srLabel}
                      className={cn(
                        "inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        activo
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/admin/courses/new"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 font-semibold shadow-sm")}
          >
            <Plus className="size-4" aria-hidden="true" /> Nuevo curso
          </Link>
        </div>
      </header>

      <section aria-labelledby="kpis-title" className="flex flex-col gap-4">
        <h2 id="kpis-title" className="sr-only">
          Indicadores del periodo
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Inscripciones"
            value={inscripcionesPeriodo.toLocaleString("es-PE")}
            icon={GraduationCap}
            hint="Nuevas en el periodo, de pago y gratuitas"
            delta={getDelta(inscripcionesPeriodo, inscripcionesPrevias)}
            href="/admin/students"
            linkLabel="Ver estudiantes"
          />
          <StatCard
            label="Ingresos estimados"
            value={formatSoles(ingresosPeriodo)}
            icon={CircleDollarSign}
            hint="Calculado con precios actuales de catálogo y certificados"
            delta={getDelta(ingresosPeriodo, ingresosPrevios)}
          />
          <StatCard
            label="Certificados emitidos"
            value={certificadosPeriodo.toLocaleString("es-PE")}
            icon={Award}
            hint="Con fecha de emisión dentro del periodo"
            delta={getDelta(certificadosPeriodo, certificadosPrevios)}
            href="/admin/certificates"
            linkLabel="Ver certificados"
          />
          <StatCard
            label="Tasa de finalización"
            value={`${tasaFinalizacion}%`}
            icon={BookOpen}
            hint={`${completadasCohorte} de ${inscripcionesPeriodo} inscripciones del periodo ya completadas`}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TrendChart
            title="Inscripciones por día"
            description={`${periodoActual?.label} · una barra por día`}
            points={serie}
            unit="inscripciones"
          />
        </div>
        <div className="lg:col-span-2">
          <AttentionList items={pendientes} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="top-cursos-title"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="top-cursos-title" className="text-base font-bold text-foreground">
                Cursos con más inscripciones
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                En {periodoActual?.label.toLowerCase()}
              </p>
            </div>
            <Link
              href="/admin/courses"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
            >
              Ver catálogo
            </Link>
          </div>

          {topCursos.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Ningún curso recibió inscripciones en este periodo.
            </p>
          ) : (
            <ol className="mt-4 flex flex-col gap-2">
              {topCursos.map((row, i) => {
                const curso = cursoPorId.get(row.courseId);
                if (!curso) return null;

                return (
                  <li key={row.courseId}>
                    <Link
                      href={`/admin/courses/${row.courseId}`}
                      className={cn(
                        "flex min-h-14 items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 transition-colors",
                        "hover:border-primary/40 hover:bg-accent/30",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      )}
                    >
                      <span
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black tabular-nums text-primary"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {curso.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {curso.published ? "Publicado" : "Borrador"} ·{" "}
                          {curso.isFree ? "Gratuito" : "De pago"}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                        {row._count._all}
                        <span className="sr-only"> inscripciones</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section
          aria-labelledby="resumen-title"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          <h2 id="resumen-title" className="text-base font-bold text-foreground">
            Estado de la plataforma
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cifras acumuladas, no del periodo
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <dt className="text-xs font-semibold text-muted-foreground">
                Cursos en catálogo
              </dt>
              <dd className="mt-1 text-2xl font-black tabular-nums text-foreground">
                {totalCursos}
              </dd>
              <dd className="mt-0.5 text-xs text-muted-foreground">
                {cursosPublicados} publicados · {totalCursos - cursosPublicados}{" "}
                {totalCursos - cursosPublicados === 1 ? "borrador" : "borradores"}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <dt className="text-xs font-semibold text-muted-foreground">
                Estudiantes registrados
              </dt>
              <dd className="mt-1 text-2xl font-black tabular-nums text-foreground">
                {totalEstudiantes.toLocaleString("es-PE")}
              </dd>
              <dd className="mt-0.5 text-xs text-muted-foreground">
                Cuentas con rol estudiante
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-col gap-2">
            {[
              { href: "/admin/courses", icon: BookOpen, label: "Gestionar catálogo" },
              { href: "/admin/students", icon: Users, label: "Comunidad estudiantil" },
              { href: "/admin/support", icon: LifeBuoy, label: "Bandeja de soporte" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 text-sm font-semibold text-foreground transition-colors",
                  "hover:border-primary/40 hover:bg-accent/30",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <Icon className="size-4 text-primary" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
