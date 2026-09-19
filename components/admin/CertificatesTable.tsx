import Link from "next/link";
import { Award, Download, ExternalLink, Plus, UserPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { SearchInput } from "@/components/admin/filters/SearchInput";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import { EditCertificateHolderDialog } from "@/components/admin/EditCertificateHolderDialog";
import { formatDate, getCertificateEffectiveStatus } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/pagination";

export type CertificateRow = {
  id: string;
  enrollmentId: string | null;
  verificationCode: string;
  issueDate: Date;
  expiresAt: Date | null;
  status: "ACTIVE" | "REVOKED" | "PENDING_PAYMENT" | "EXPIRED";
  certificateTitle: string | null;
  holderName: string | null;
  holderDni: string | null;
  holderCompany: string | null;
  enrollment: {
    user: { name: string; company: string | null };
    course: { title: string };
  } | null;
  course: { title: string } | null;
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo" },
  { value: "EXPIRED", label: "Vencido" },
  { value: "REVOKED", label: "Revocado" },
  { value: "PENDING_PAYMENT", label: "Pago pendiente" },
];

const ORIGIN_OPTIONS = [
  { value: "exam", label: "Por examen" },
  { value: "manual", label: "Manual" },
];

const CERT_FILTER_PARAMS = ["q", "status", "origin"];

type Props = {
  certificates: CertificateRow[];
  meta: PaginationMeta;
  hasFilters: boolean;
};

export function CertificatesTable({ certificates, meta, hasFilters }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchInput
          placeholder="Buscar por titular, curso o código…"
          className="md:max-w-sm"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect
            param="status"
            options={STATUS_OPTIONS}
            allLabel="Todos los estados"
            placeholder="Estado"
            className="h-9 min-w-[160px]"
          />
          <FilterSelect
            param="origin"
            options={ORIGIN_OPTIONS}
            allLabel="Todos los tipos"
            placeholder="Tipo"
            className="h-9 min-w-[150px]"
          />
          {hasFilters && (
            <ClearFiltersButton params={CERT_FILTER_PARAMS} label="Limpiar" />
          )}
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <EmptyState
            icon={Award}
            title={
              hasFilters
                ? "Ningún certificado coincide con los filtros"
                : "Aún no hay certificados emitidos"
            }
            description={
              hasFilters
                ? "Prueba cambiando los criterios de búsqueda."
                : "Cuando un estudiante apruebe el examen se generará un certificado. También puedes emitir certificados manualmente para personas externas."
            }
            action={
              hasFilters ? (
                <ClearFiltersButton params={CERT_FILTER_PARAMS} />
              ) : (
                <Button render={<Link href="/admin/certificates/new" />} nativeButton={false}>
                  <Plus className="size-4" /> Crear certificado manual
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
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
                    // Igual que el PDF: manda el titular congelado al emitir.
                    const titular =
                      cert.holderName ?? cert.enrollment?.user.name ?? "—";
                    const empresa =
                      cert.holderCompany ?? cert.enrollment?.user.company ?? null;
                    const curso =
                      cert.enrollment?.course.title ??
                      cert.certificateTitle ??
                      cert.course?.title ??
                      "—";
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
                            <EditCertificateHolderDialog
                              certificateId={cert.id}
                              holderName={titular === "—" ? "" : titular}
                              holderDni={cert.holderDni}
                              holderCompany={empresa}
                              trigger={
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  title="Corregir titular"
                                  aria-label={`Corregir el titular de ${titular}`}
                                >
                                  <UserPen className="size-4" />
                                </Button>
                              }
                            />
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

          <Pagination
            meta={meta}
            itemLabel={{ one: "certificado", many: "certificados" }}
          />
        </>
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
