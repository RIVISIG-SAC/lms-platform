import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Mis Cursos | Cursos Pro" };

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  PAID: { label: "En progreso", class: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completado", class: "bg-green-100 text-green-700" },
  EXPIRED: { label: "Expirado", class: "bg-slate-100 text-slate-500" },
  FAILED: { label: "No aprobado", class: "bg-red-100 text-red-600" },
  PENDING: { label: "Pendiente", class: "bg-amber-100 text-amber-700" },
};

export default async function StudentMyCoursesPage() {
  const session = await getRequiredSession();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId },
    orderBy: { startDate: "desc" },
    include: {
      course: {
        include: { _count: { select: { modules: true } } },
      },
      certificate: { select: { verificationCode: true, status: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Mis Cursos
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          {enrollments.length} inscripción{enrollments.length !== 1 ? "es" : ""}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12 text-center space-y-3">
          <p className="text-[var(--muted-foreground)]">
            No tienes cursos activos todavía.
          </p>
          <Link
            href="/student/catalog"
            className="inline-block bg-[var(--primary)] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const { course } = enrollment;
            const statusInfo = STATUS_LABELS[enrollment.status] ?? STATUS_LABELS.PENDING;
            const isActive = enrollment.status === "PAID" || enrollment.status === "COMPLETED";
            const isExpired = enrollment.status === "EXPIRED";

            return (
              <div
                key={enrollment.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex gap-5"
              >
                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-800">
                  {course.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium text-[var(--foreground)] truncate">
                      {course.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {isActive && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
                        <span>Progreso</span>
                        <span>{Math.round(enrollment.progressPercentage)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full transition-all"
                          style={{ width: `${enrollment.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex gap-4 text-xs text-[var(--muted-foreground)]">
                      <span>Inicio: {formatDate(enrollment.startDate)}</span>
                      {!isExpired && (
                        <span>Vence: {formatDate(enrollment.endDate)}</span>
                      )}
                      {enrollment.certificate?.status === "ACTIVE" && (
                        <span className="text-green-600 font-medium">✓ Certificado</span>
                      )}
                    </div>

                    <div className="flex gap-3 text-sm flex-shrink-0">
                      {enrollment.status === "FAILED" && (
                        <Link
                          href={`/student/catalog/${course.id}`}
                          className="text-[var(--primary)] hover:underline"
                        >
                          Reinscribirse
                        </Link>
                      )}
                      {isExpired && (
                        <Link
                          href={`/student/catalog/${course.id}`}
                          className="text-[var(--primary)] hover:underline"
                        >
                          Renovar
                        </Link>
                      )}
                      {isActive && (
                        <Link
                          href={`/student/courses/${course.id}`}
                          className="bg-[var(--primary)] text-white text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90"
                        >
                          {enrollment.progressPercentage > 0 ? "Continuar" : "Iniciar"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
