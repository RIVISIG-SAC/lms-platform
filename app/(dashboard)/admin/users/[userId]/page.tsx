import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  IdCard,
  Inbox,
  KeyRound,
  LifeBuoy,
  Lock,
  Mail,
  MailCheck,
  MailWarning,
  SearchX,
  ShieldAlert,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { UrlTabs } from "@/components/admin/UrlTabs";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import { UserActiveToggle } from "@/components/admin/UserActiveToggle";
import { IssueCertificateButton } from "@/components/admin/IssueCertificateButton";
import { EnrollStudentDialog } from "@/components/admin/EnrollStudentDialog";
import { ENROLLMENT_ACCESS_DAYS } from "@/lib/enrollments";
import { EXAM_MAX_ATTEMPTS, EXAM_PASSING_SCORE } from "@/lib/validations/exam";
import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUSES,
  type SupportStatus,
} from "@/lib/validations/support";
import {
  buildPagination,
  getEnumParam,
  getPageSize,
  getRequestedPage,
  getSearchParam,
  type SearchParamsRecord,
} from "@/lib/pagination";
import {
  cn,
  formatDate,
  getCertificateEffectiveStatus,
  toCertificateHolderName,
} from "@/lib/utils";

type Props = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<unknown>;
};

export async function generateMetadata({ params }: Pick<Props, "params">) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  return { title: user ? `${user.name} | Admin` : "Usuario | Admin" };
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  STUDENT: "Estudiante",
  INSTRUCTOR: "Instructor",
};

const PROFILE_TABS = ["formacion", "soporte"] as const;

const ENROLLMENT_STATUSES = [
  "PENDING",
  "PAID",
  "COMPLETED",
  "FAILED",
  "EXPIRED",
] as const;

const ENROLLMENT_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PAID: { label: "Activa", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Completada", className: "bg-blue-100 text-blue-700 border-blue-200" },
  PENDING: { label: "Pendiente", className: "bg-muted text-muted-foreground border-border" },
  FAILED: { label: "Reprobada", className: "bg-destructive/10 text-destructive border-destructive/20" },
  EXPIRED: { label: "Expirada", className: "bg-amber-100 text-amber-800 border-amber-200" },
};

const CERTIFICATE_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Vigente", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  EXPIRED: { label: "Vencido", className: "bg-amber-100 text-amber-800 border-amber-200" },
  REVOKED: { label: "Revocado", className: "bg-destructive/10 text-destructive border-destructive/20" },
  PENDING_PAYMENT: { label: "Pago pendiente", className: "bg-muted text-muted-foreground border-border" },
};

const SUPPORT_STATUS_BADGE: Record<SupportStatus, string> = {
  OPEN: "bg-amber-100 text-amber-800 border-amber-200",
  ANSWERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CLOSED: "bg-muted text-muted-foreground border-border",
};

const ENROLLMENT_STATUS_OPTIONS = ENROLLMENT_STATUSES.map((value) => ({
  value,
  label: ENROLLMENT_STATUS_BADGE[value].label,
}));

const SUPPORT_STATUS_OPTIONS = SUPPORT_STATUSES.map((value) => ({
  value,
  label: SUPPORT_STATUS_LABELS[value],
}));

const DIA_MS = 24 * 60 * 60 * 1000;

/** Días que faltan (positivo) o que ya pasaron (negativo) hasta una fecha. */
function diasHasta(fecha: Date) {
  return Math.ceil((fecha.getTime() - Date.now()) / DIA_MS);
}

/**
 * Todo lo que el admin necesita del alumno: inscripciones con su progreso e
 * intentos de examen, y las consultas de soporte que ha enviado.
 *
 * Ambas listas van paginadas aunque hoy sean cortas: un alumno veterano acumula
 * cursos y consultas sin tope. La URL lleva una sola `page`, así que se aplica a
 * la pestaña que se está viendo y la otra arranca en su primera página
 * (`UrlTabs` ya limpia `page` al cambiar de pestaña).
 */
async function cargarPerfilEstudiante(userId: string, sp: SearchParamsRecord) {
  const tab = getEnumParam(sp, "tab", PROFILE_TABS, "formacion");
  const estado = getEnumParam(sp, "estado", ENROLLMENT_STATUSES);
  const soporte = getEnumParam(sp, "soporte", SUPPORT_STATUSES);
  const pageSize = getPageSize(sp);
  const paginaPedida = getRequestedPage(sp);

  const enrollmentWhere: Prisma.EnrollmentWhereInput = {
    userId,
    ...(estado !== "all" ? { status: estado } : {}),
  };
  const supportWhere: Prisma.SupportMessageWhereInput = {
    userId,
    ...(soporte !== "all" ? { status: soporte } : {}),
  };

  const [
    totalInscripciones,
    inscripcionesFiltradas,
    completados,
    certificadosVigentes,
    totalConsultas,
    consultasFiltradas,
    consultasAbiertas,
  ] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.enrollment.count({ where: enrollmentWhere }),
    prisma.enrollment.count({ where: { userId, status: "COMPLETED" } }),
    prisma.certificate.count({
      where: {
        enrollment: { userId },
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
    prisma.supportMessage.count({ where: { userId } }),
    prisma.supportMessage.count({ where: supportWhere }),
    prisma.supportMessage.count({ where: { userId, status: "OPEN" } }),
  ]);

  const enrollmentsMeta = buildPagination({
    requestedPage: tab === "formacion" ? paginaPedida : 1,
    pageSize,
    totalItems: inscripcionesFiltradas,
  });
  const supportMeta = buildPagination({
    requestedPage: tab === "soporte" ? paginaPedida : 1,
    pageSize,
    totalItems: consultasFiltradas,
  });

  const [enrollments, supportMessages] = await Promise.all([
    prisma.enrollment.findMany({
      where: enrollmentWhere,
      orderBy: { createdAt: "desc" },
      skip: enrollmentsMeta.skip,
      take: enrollmentsMeta.pageSize,
      select: {
        id: true,
        status: true,
        progressPercentage: true,
        startDate: true,
        endDate: true,
        course: { select: { id: true, title: true } },
        // Como mucho EXAM_MAX_ATTEMPTS por inscripción: caben enteros.
        examAttempts: {
          orderBy: { attemptNumber: "asc" },
          select: {
            id: true,
            attemptNumber: true,
            score: true,
            passed: true,
            createdAt: true,
          },
        },
        certificate: {
          select: {
            id: true,
            verificationCode: true,
            status: true,
            issueDate: true,
            expiresAt: true,
            holderName: true,
          },
        },
      },
    }),
    prisma.supportMessage.findMany({
      where: supportWhere,
      orderBy: { createdAt: "desc" },
      skip: supportMeta.skip,
      take: supportMeta.pageSize,
      select: {
        id: true,
        subject: true,
        message: true,
        status: true,
        courseTitle: true,
        createdAt: true,
        answeredAt: true,
      },
    }),
  ]);

  return {
    enrollments,
    enrollmentsMeta,
    enrollmentFilter: estado,
    supportMessages,
    supportMeta,
    supportFilter: soporte,
    totalInscripciones,
    completados,
    certificadosVigentes,
    totalConsultas,
    consultasAbiertas,
  };
}

/** Dato de identidad del alumno, con su icono y su estado de aviso. */
function DatoPerfil({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Mail;
  label: string;
  value: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "warning" ? "text-amber-600" : "text-muted-foreground",
        )}
      />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "text-sm font-medium break-words",
            tone === "warning" ? "text-amber-700" : "text-foreground",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SinDato() {
  return <span className="italic text-muted-foreground/70">Sin registrar</span>;
}

export default async function UserDetailPage({ params, searchParams }: Props) {
  const { userId } = await params;
  const sp = (await searchParams) as SearchParamsRecord;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      dni: true,
      company: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      lockedUntil: true,
      passwordExpiresAt: true,
      createdAt: true,
      instructorProfile: { select: { id: true, bio: true, title: true } },
    },
  });

  if (!user) notFound();

  const esEstudiante = user.role === "STUDENT";

  const [activeAdminCount, perfil, cursos] = await Promise.all([
    user.role === "ADMIN"
      ? prisma.user.count({ where: { role: "ADMIN", isActive: true } })
      : Promise.resolve(0),
    esEstudiante ? cargarPerfilEstudiante(user.id, sp) : Promise.resolve(null),
    esEstudiante
      ? prisma.course.findMany({
          where: { published: true },
          select: { id: true, title: true },
          orderBy: { title: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const isLastActiveAdmin =
    user.role === "ADMIN" && user.isActive && activeAdminCount <= 1;

  // Esta ficha se abre desde /admin/students y desde /admin/users; el `from`
  // devuelve al admin a la lista de la que vino.
  const desdeEstudiantes = getSearchParam(sp, "from") === "students";
  const volverA = desdeEstudiantes ? "/admin/students" : "/admin/users";
  const volverLabel = desdeEstudiantes ? "Estudiantes" : "Usuarios";

  const passwordVencida = user.passwordExpiresAt.getTime() < Date.now();
  const diasPassword = diasHasta(user.passwordExpiresAt);
  const bloqueado =
    user.lockedUntil !== null && user.lockedUntil.getTime() > Date.now();

  const metricas = perfil
    ? [
        { icon: BookOpen, label: "Inscripciones", value: perfil.totalInscripciones },
        { icon: GraduationCap, label: "Completados", value: perfil.completados },
        { icon: Award, label: "Certificados vigentes", value: perfil.certificadosVigentes },
        {
          icon: LifeBuoy,
          label: "Consultas abiertas",
          value: perfil.consultasAbiertas,
          alerta: perfil.consultasAbiertas > 0,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink
              href={volverA}
              className="font-medium normal-case tracking-normal"
            >
              {volverLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium normal-case tracking-normal">
              {user.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-xl font-bold text-primary">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {user.name}
              </h1>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
              {!user.isActive && (
                <span className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                  Cuenta inactiva
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <a href={`mailto:${user.email}`} className="truncate hover:underline">
                {user.email}
              </a>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {user.isActive ? "Cuenta activa" : "Cuenta inactiva"}
            </span>
            <UserActiveToggle
              userId={user.id}
              isActive={user.isActive}
              isLastActiveAdmin={isLastActiveAdmin}
            />
            {esEstudiante && (
              <EnrollStudentDialog
                courses={cursos}
                prefilledStudent={{
                  id: user.id,
                  email: user.email,
                  name: user.name,
                }}
                trigger={
                  <Button type="button" size="sm" className="gap-1.5">
                    <GraduationCap className="size-4" />
                    Inscribir en curso
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-border/60 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <DatoPerfil icon={IdCard} label="DNI" value={user.dni ?? <SinDato />} />
          <DatoPerfil
            icon={Building2}
            label="Empresa"
            value={user.company ?? <SinDato />}
          />
          <DatoPerfil
            icon={user.emailVerified ? MailCheck : MailWarning}
            label="Correo"
            tone={user.emailVerified ? "default" : "warning"}
            value={user.emailVerified ? "Verificado" : "Sin verificar"}
          />
          <DatoPerfil
            icon={Calendar}
            label="Registro"
            value={formatDate(user.createdAt)}
          />
          <DatoPerfil
            icon={CalendarClock}
            label="Último acceso"
            value={user.lastLoginAt ? formatDate(user.lastLoginAt) : <SinDato />}
          />
          <DatoPerfil
            icon={KeyRound}
            label="Contraseña"
            tone={passwordVencida || diasPassword <= 15 ? "warning" : "default"}
            value={
              passwordVencida
                ? `Vencida el ${formatDate(user.passwordExpiresAt)}`
                : `Vence el ${formatDate(user.passwordExpiresAt)} (${diasPassword} d)`
            }
          />
        </div>

        {bloqueado && user.lockedUntil && (
          <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-800">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <span>
              Cuenta bloqueada por intentos fallidos hasta el{" "}
              <strong>{formatDate(user.lockedUntil)}</strong>. Hasta entonces no
              puede iniciar sesión.
            </span>
          </p>
        )}

        {!user.emailVerified && (
          <p className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-800">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              El correo no está verificado: no recibirá los avisos de
              certificado ni de vencimiento de acceso hasta que lo confirme.
            </span>
          </p>
        )}
      </div>

      {user.instructorProfile && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Perfil de instructor
          </h2>
          <p className="text-sm text-foreground">
            {user.instructorProfile.bio ?? "Sin bio registrada."}
          </p>
          {user.instructorProfile.title && (
            <p className="text-xs text-muted-foreground">
              {user.instructorProfile.title}
            </p>
          )}
          <Link
            href={`/instructores/${user.instructorProfile.id}`}
            className="text-xs text-primary underline"
            target="_blank"
          >
            Ver página pública del instructor →
          </Link>
        </div>
      )}

      {perfil && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metricas.map(({ icon: Icon, label, value, alerta }) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl border p-3 sm:p-4",
                  alerta ? "border-amber-200 bg-amber-50/50" : "border-border bg-card",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "size-3.5",
                      alerta ? "text-amber-600" : "text-muted-foreground",
                    )}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-1.5 text-2xl font-black tabular-nums tracking-tight",
                    alerta ? "text-amber-700" : "text-foreground",
                  )}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <UrlTabs defaultTab="formacion" resetParams={["page", "estado", "soporte"]}>
            <TabsList className="h-13 w-full justify-start gap-1 overflow-x-auto bg-muted p-1.5">
              <TabsTrigger
                value="formacion"
                className="flex-none gap-2 px-5 text-sm font-semibold"
              >
                <BookOpen className="size-4.5" />
                Formación
                <Badge
                  variant="outline"
                  className="ml-1 text-[11px] font-bold tabular-nums"
                >
                  {perfil.totalInscripciones}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="soporte"
                className="flex-none gap-2 px-5 text-sm font-semibold"
              >
                <LifeBuoy className="size-4.5" />
                Soporte
                <Badge
                  variant="outline"
                  className="ml-1 text-[11px] font-bold tabular-nums"
                >
                  {perfil.totalConsultas}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="formacion" className="mt-6">
              <div className="flex flex-col gap-4">
                {perfil.totalInscripciones > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground">
                      El acceso a cada curso dura {ENROLLMENT_ACCESS_DAYS} días
                      desde la inscripción.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <FilterSelect
                        param="estado"
                        options={ENROLLMENT_STATUS_OPTIONS}
                        allLabel="Todos los estados"
                        placeholder="Estado"
                        className="h-9 min-w-[160px]"
                      />
                      {perfil.enrollmentFilter !== "all" && (
                        <ClearFiltersButton
                          params={["estado", "page"]}
                          label="Limpiar"
                        />
                      )}
                    </div>
                  </div>
                )}

                {perfil.enrollments.length === 0 ? (
                  <EmptyState
                    icon={perfil.enrollmentFilter !== "all" ? SearchX : BookOpen}
                    title={
                      perfil.enrollmentFilter !== "all"
                        ? "Ninguna inscripción con ese estado"
                        : "Este alumno aún no está inscrito"
                    }
                    description={
                      perfil.enrollmentFilter !== "all"
                        ? "Prueba con otro estado o limpia el filtro."
                        : "Usa «Inscribir en curso» para darle acceso a un curso publicado."
                    }
                    action={
                      perfil.enrollmentFilter !== "all" ? (
                        <ClearFiltersButton params={["estado", "page"]} />
                      ) : undefined
                    }
                  />
                ) : (
                  <ul className="flex flex-col gap-3">
                    {perfil.enrollments.map((enrollment) => {
                      const badge = ENROLLMENT_STATUS_BADGE[enrollment.status] ?? {
                        label: enrollment.status,
                        className: "",
                      };
                      const progreso = Math.round(enrollment.progressPercentage);
                      const diasAcceso = diasHasta(enrollment.endDate);
                      const intentosRestantes =
                        EXAM_MAX_ATTEMPTS - enrollment.examAttempts.length;
                      const certificado = enrollment.certificate;
                      const certStatus = certificado
                        ? getCertificateEffectiveStatus(
                            certificado.status,
                            certificado.expiresAt,
                          )
                        : null;

                      return (
                        <li
                          key={enrollment.id}
                          className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/admin/courses/${enrollment.course.id}`}
                                className="font-semibold text-foreground hover:underline"
                              >
                                {enrollment.course.title}
                              </Link>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <Calendar className="size-3.5" />
                                  {formatDate(enrollment.startDate)} →{" "}
                                  {formatDate(enrollment.endDate)}
                                </span>
                                <span
                                  className={cn(
                                    "font-semibold",
                                    diasAcceso <= 0
                                      ? "text-destructive"
                                      : diasAcceso <= 15
                                        ? "text-amber-700"
                                        : "text-muted-foreground",
                                  )}
                                >
                                  {diasAcceso <= 0
                                    ? "Acceso vencido"
                                    : `Quedan ${diasAcceso} días de acceso`}
                                </span>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                badge.className,
                              )}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <div
                              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                              role="presentation"
                            >
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${progreso}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                              {progreso}%
                            </span>
                          </div>

                          <div className="mt-4 grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
                            <div>
                              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <ClipboardList className="size-3.5" />
                                Evaluación
                              </p>
                              {enrollment.examAttempts.length === 0 ? (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Sin intentos. Dispone de {EXAM_MAX_ATTEMPTS} y
                                  aprueba con {EXAM_PASSING_SCORE}%.
                                </p>
                              ) : (
                                <ul className="mt-2 flex flex-col gap-1.5">
                                  {enrollment.examAttempts.map((intento) => (
                                    <li
                                      key={intento.id}
                                      className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
                                    >
                                      <span className="font-medium text-foreground">
                                        Intento {intento.attemptNumber}
                                      </span>
                                      <span
                                        className={cn(
                                          "font-bold tabular-nums",
                                          intento.passed
                                            ? "text-emerald-700"
                                            : "text-destructive",
                                        )}
                                      >
                                        {Math.round(intento.score)}%
                                      </span>
                                      <span className="text-muted-foreground">
                                        {intento.passed ? "Aprobado" : "Reprobado"}
                                      </span>
                                      <span className="text-muted-foreground/70">
                                        · {formatDate(intento.createdAt)}
                                      </span>
                                    </li>
                                  ))}
                                  <li className="text-[11px] text-muted-foreground">
                                    {intentosRestantes > 0
                                      ? `Le ${intentosRestantes === 1 ? "queda" : "quedan"} ${intentosRestantes} de ${EXAM_MAX_ATTEMPTS} ${intentosRestantes === 1 ? "intento" : "intentos"}.`
                                      : "Agotó los intentos permitidos."}
                                  </li>
                                </ul>
                              )}
                            </div>

                            <div>
                              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <Award className="size-3.5" />
                                Certificado
                              </p>
                              {certificado && certStatus ? (
                                <div className="mt-2 flex flex-col gap-1 text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                      href={`/verificar/${certificado.verificationCode}`}
                                      target="_blank"
                                      className="font-mono font-semibold text-primary hover:underline"
                                    >
                                      {certificado.verificationCode}
                                    </Link>
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
                                        CERTIFICATE_STATUS_BADGE[certStatus].className,
                                      )}
                                    >
                                      {CERTIFICATE_STATUS_BADGE[certStatus].label}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground">
                                    Emitido el {formatDate(certificado.issueDate)}
                                    {certificado.expiresAt
                                      ? ` · vence el ${formatDate(certificado.expiresAt)}`
                                      : " · sin vencimiento"}
                                  </p>
                                  {/* El titular se congela al emitir: si el alumno
                                      cambió su nombre después, el PDF sigue
                                      llevando este. */}
                                  {certificado.holderName &&
                                    toCertificateHolderName(certificado.holderName) !==
                                      toCertificateHolderName(user.name) && (
                                      <p className="text-amber-700">
                                        Emitido a nombre de{" "}
                                        <strong>
                                          {toCertificateHolderName(
                                            certificado.holderName,
                                          )}
                                        </strong>
                                      </p>
                                    )}
                                </div>
                              ) : (
                                <div className="mt-2 flex flex-col items-start gap-2">
                                  <p className="text-xs text-muted-foreground">
                                    Todavía no tiene certificado en este curso.
                                  </p>
                                  {["PAID", "COMPLETED"].includes(enrollment.status) && (
                                    <IssueCertificateButton
                                      enrollmentId={enrollment.id}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <Pagination
                  meta={perfil.enrollmentsMeta}
                  itemLabel={{ one: "inscripción", many: "inscripciones" }}
                />
              </div>
            </TabsContent>

            <TabsContent value="soporte" className="mt-6">
              <div className="flex flex-col gap-4">
                {perfil.totalConsultas > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground">
                      Consultas enviadas desde «Contactar tutor».
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <FilterSelect
                        param="soporte"
                        options={SUPPORT_STATUS_OPTIONS}
                        allLabel="Todos los estados"
                        placeholder="Estado"
                        className="h-9 min-w-[160px]"
                      />
                      <Button
                        render={<Link href="/admin/support" />}
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                      >
                        Ir a la bandeja
                      </Button>
                    </div>
                  </div>
                )}

                {perfil.supportMessages.length === 0 ? (
                  <EmptyState
                    icon={perfil.supportFilter !== "all" ? SearchX : Inbox}
                    title={
                      perfil.supportFilter !== "all"
                        ? "Ninguna consulta con ese estado"
                        : "Este alumno no ha escrito a soporte"
                    }
                    description={
                      perfil.supportFilter !== "all"
                        ? "Prueba con otro estado o limpia el filtro."
                        : "Aquí aparecerán las consultas que envíe desde su panel."
                    }
                    action={
                      perfil.supportFilter !== "all" ? (
                        <ClearFiltersButton params={["soporte", "page"]} />
                      ) : undefined
                    }
                  />
                ) : (
                  <ul className="flex flex-col gap-3">
                    {perfil.supportMessages.map((consulta) => (
                      <li
                        key={consulta.id}
                        className={cn(
                          "rounded-2xl border bg-card p-4 shadow-sm sm:p-5",
                          consulta.status === "OPEN"
                            ? "border-amber-200"
                            : "border-border",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">
                              {consulta.subject}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>{formatDate(consulta.createdAt)}</span>
                              {consulta.courseTitle && (
                                <span className="inline-flex items-center gap-1.5">
                                  <BookOpen className="size-3.5" />
                                  {consulta.courseTitle}
                                </span>
                              )}
                              {consulta.answeredAt && (
                                <span>
                                  Respondida el {formatDate(consulta.answeredAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
                              SUPPORT_STATUS_BADGE[consulta.status],
                            )}
                          >
                            {SUPPORT_STATUS_LABELS[consulta.status]}
                          </span>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                          {consulta.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <Pagination
                  meta={perfil.supportMeta}
                  itemLabel={{ one: "consulta", many: "consultas" }}
                />
              </div>
            </TabsContent>
          </UrlTabs>
        </>
      )}
    </div>
  );
}
