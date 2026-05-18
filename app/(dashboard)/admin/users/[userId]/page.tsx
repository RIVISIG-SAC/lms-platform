import { notFound } from "next/navigation";
import Link from "next/link";
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
import { UserActiveToggle } from "@/components/admin/UserActiveToggle";
import { IssueCertificateButton } from "@/components/admin/IssueCertificateButton";
import { Mail, Calendar, BookOpen, Award } from "lucide-react";

export const metadata = { title: "Detalle de usuario | Admin" };

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  STUDENT: "Estudiante",
  INSTRUCTOR: "Instructor",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  COMPLETED: "Completado",
  FAILED: "Reprobado",
  EXPIRED: "Expirado",
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  PAID: "secondary",
  COMPLETED: "default",
  FAILED: "destructive",
  EXPIRED: "outline",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: { select: { title: true } },
          certificate: true,
        },
        orderBy: { createdAt: "desc" },
      },
      instructorProfile: true,
    },
  });

  if (!user) notFound();

  const activeAdminCount = await prisma.user.count({
    where: { role: "ADMIN", isActive: true },
  });
  const isLastActiveAdmin =
    user.role === "ADMIN" && user.isActive && activeAdminCount <= 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/users" className="normal-case tracking-normal font-medium">
              Usuarios
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              {user.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="size-16 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-xl font-bold text-primary shrink-0">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {user.name}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {roleLabel[user.role] ?? user.role}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Mail className="size-3.5" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Calendar className="size-3.5" />
              <span>
                Registrado el{" "}
                {user.createdAt.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">
              {user.isActive ? "Cuenta activa" : "Cuenta inactiva"}
            </span>
            <UserActiveToggle
              userId={user.id}
              isActive={user.isActive}
              isLastActiveAdmin={isLastActiveAdmin}
            />
          </div>
        </div>
      </div>

      {/* Instructor profile */}
      {user.instructorProfile && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Perfil de instructor
          </h2>
          <p className="text-sm text-foreground">
            {user.instructorProfile.bio ?? "Sin bio registrada."}
          </p>
          {user.instructorProfile.title && (
            <p className="text-xs text-muted-foreground">{user.instructorProfile.title}</p>
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

      {/* Enrollments */}
      {user.role === "STUDENT" && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Inscripciones ({user.enrollments.length})
            </h2>
          </div>
          {user.enrollments.length === 0 ? (
            <p className="px-6 py-6 text-sm text-muted-foreground">
              Sin inscripciones registradas.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {user.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="px-6 py-4 flex items-center gap-4 flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {enrollment.course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusVariant[enrollment.status] ?? "outline"} className="text-[10px]">
                        {statusLabel[enrollment.status] ?? enrollment.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(enrollment.progressPercentage)}% completado
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {enrollment.certificate?.status === "ACTIVE" ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <Award className="size-3.5" />
                        Certificado emitido
                      </div>
                    ) : (
                      ["PAID", "COMPLETED"].includes(enrollment.status) && (
                        <IssueCertificateButton enrollmentId={enrollment.id} />
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
