import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Award, Download, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDate, getCertificateEffectiveStatus } from "@/lib/utils";

export const metadata = { title: "Certificados | Admin" };

export default async function AdminCertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    orderBy: { issueDate: "desc" },
    include: {
      enrollment: {
        include: {
          user: { select: { name: true, company: true } },
          course: { select: { title: true } },
        },
      },
      course: { select: { title: true } },
    },
  });

  const manualCount = certificates.filter((c) => c.enrollmentId === null).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Certificados
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4 min-w-0">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <Award className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Certificados emitidos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {certificates.length} {certificates.length === 1 ? "certificado" : "certificados"} ·{" "}
              {manualCount} manual{manualCount === 1 ? "" : "es"}
            </p>
          </div>
        </div>
        <Button
          render={<Link href="/admin/certificates/new" />}
          nativeButton={false}
          className="shrink-0 shadow-sm"
        >
          <Plus className="size-4" /> Crear certificado manual
        </Button>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <EmptyState
            icon={Award}
            title="Aún no hay certificados emitidos"
            description="Cuando un estudiante apruebe el examen se generará un certificado. También puedes emitir certificados manualmente para personas externas."
            action={
              <Button render={<Link href="/admin/certificates/new" />} nativeButton={false}>
                <Plus className="size-4" /> Crear certificado manual
              </Button>
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Titular</th>
                  <th className="text-left px-4 py-3">Título</th>
                  <th className="text-left px-4 py-3">Emitido</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3">Código</th>
                  <th className="text-right px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {certificates.map((cert) => {
                  const isManual = cert.enrollmentId === null;
                  const titular =
                    cert.enrollment?.user.name ?? cert.holderName ?? "—";
                  const empresa =
                    cert.enrollment?.user.company ?? cert.holderCompany ?? null;
                  const curso =
                    cert.enrollment?.course.title ?? cert.certificateTitle ?? cert.course?.title ?? "—";
                  const effectiveStatus = getCertificateEffectiveStatus(
                    cert.status,
                    cert.expiresAt,
                  );

                  return (
                    <tr key={cert.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{titular}</div>
                        {empresa && (
                          <div className="text-xs text-muted-foreground mt-0.5">{empresa}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">{curso}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(cert.issueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={effectiveStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={isManual ? "default" : "outline"}
                          className="font-semibold"
                        >
                          {isManual ? "Manual" : "Examen"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {cert.verificationCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            render={
                              <Link href={`/api/certificates/${cert.verificationCode}/download`} />
                            }
                            nativeButton={false}
                            title="Descargar PDF"
                          >
                            <Download className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            render={
                              <Link
                                href={`/verificar/${cert.verificationCode}`}
                                target="_blank"
                              />
                            }
                            nativeButton={false}
                            title="Ver verificación pública"
                          >
                            <ExternalLink className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Activo", className: "bg-green-600 hover:bg-green-600 text-white" },
    EXPIRED: { label: "Vencido", className: "bg-amber-500 hover:bg-amber-500 text-white" },
    REVOKED: { label: "Revocado", className: "bg-destructive text-white" },
    PENDING_PAYMENT: {
      label: "Pago pendiente",
      className: "bg-muted text-foreground border border-border",
    },
  };
  const cfg = map[status] ?? { label: status, className: "" };
  return <Badge className={`${cfg.className} border-none text-xs`}>{cfg.label}</Badge>;
}
