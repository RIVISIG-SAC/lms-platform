import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { Award, BookOpen, Download, Lock, CalendarX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, getCertificateEffectiveStatus } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Mis Certificados | Estudiante" };

export default async function StudentCertificatesPage() {
  const session = await getRequiredSession();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId, status: { not: "PENDING" } },
    orderBy: { startDate: "desc" },
    include: {
      course: { select: { id: true, title: true, thumbnailUrl: true } },
      certificate: { select: { verificationCode: true, status: true, issueDate: true, expiresAt: true } },
    },
  });

  const withCert = enrollments.filter(
    (e) =>
      e.certificate &&
      getCertificateEffectiveStatus(e.certificate.status, e.certificate.expiresAt) === "ACTIVE"
  );
  const expired = enrollments.filter(
    (e) =>
      e.certificate &&
      getCertificateEffectiveStatus(e.certificate.status, e.certificate.expiresAt) === "EXPIRED"
  );
  const pending = enrollments.filter((e) => e.certificate?.status === "PENDING_PAYMENT");
  const notEligible = enrollments.filter(
    (e) => !e.certificate && !["PAID", "COMPLETED"].includes(e.status)
  );
  const eligible = enrollments.filter(
    (e) => !e.certificate && ["PAID", "COMPLETED"].includes(e.status)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Mis Certificados
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
          <Award className="size-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Certificados</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {withCert.length} certificado{withCert.length !== 1 ? "s" : ""} disponible{withCert.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Active certificates */}
      {withCert.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Award className="size-3.5 text-amber-500" /> Certificados disponibles
          </h2>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/60">
            {withCert.map((e) => (
              <div key={e.id} className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4">
                <div className="size-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Award className="size-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{e.course.title}</p>
                  {e.certificate?.issueDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Emitido el{" "}
                      {new Date(e.certificate.issueDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {e.certificate?.expiresAt ? (
                    <p className="text-xs text-amber-600 font-medium mt-0.5">
                      Válido hasta{" "}
                      {new Date(e.certificate.expiresAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 font-medium mt-0.5">Sin fecha de vencimiento</p>
                  )}
                </div>
                <a
                  href={`/api/certificates/${e.certificate!.verificationCode}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "shrink-0 gap-2 bg-amber-500 hover:bg-amber-600 text-white border-none"
                  )}
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Descargar</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Expired certificates */}
      {expired.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <CalendarX className="size-3.5 text-destructive" /> Certificados vencidos
          </h2>
          <div className="rounded-xl border border-border/50 bg-muted/20 shadow-sm overflow-hidden divide-y divide-border/40">
            {expired.map((e) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-4 opacity-70">
                <div className="size-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <CalendarX className="size-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{e.course.title}</p>
                  <p className="text-xs text-destructive mt-0.5">
                    Venció el{" "}
                    {new Date(e.certificate!.expiresAt!).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">Contacta al administrador si necesitas renovarlo.</p>
                </div>
                <Badge variant="destructive" className="text-[10px] font-semibold shrink-0">Vencido</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending payment */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Award className="size-3.5 text-orange-400" /> Pago de certificado pendiente
          </h2>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/60">
            {pending.map((e) => (
              <div key={e.id} className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4">
                <div className="size-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                  <Award className="size-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{e.course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completa el pago del certificado para descargarlo.
                  </p>
                </div>
                <Link
                  href={`/student/courses/${e.course.id}/exam`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0 gap-2")}
                >
                  <Award className="size-3.5" /> Pagar
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Eligible but not issued */}
      {eligible.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <BookOpen className="size-3.5" /> Certificado disponible para solicitar
          </h2>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/60">
            {eligible.map((e) => (
              <div key={e.id} className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4">
                <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <BookOpen className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{e.course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Curso completado — el administrador debe emitir el certificado.
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold shrink-0">En proceso</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Not eligible */}
      {notEligible.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Lock className="size-3.5" /> No disponibles
          </h2>
          <div className="rounded-xl border border-border/50 bg-muted/20 shadow-sm overflow-hidden divide-y divide-border/40">
            {notEligible.map((e) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-4 opacity-60">
                <div className="size-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                  <Lock className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{e.course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completa y aprueba el curso para habilitar el certificado.
                  </p>
                </div>
                <Link
                  href={`/student/courses/${e.course.id}`}
                  className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "shrink-0 text-xs")}
                >
                  Ir al curso
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {enrollments.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-border/60 rounded-2xl">
          <Award className="size-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm font-semibold text-muted-foreground">
            Aún no tienes inscripciones activas.
          </p>
          <Link href="/student/catalog" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}>
            Explorar cursos
          </Link>
        </div>
      )}
    </div>
  );
}
