import Link from "next/link";
import { Calendar, Mail, UserCircle, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { SearchInput } from "@/components/admin/filters/SearchInput";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import { formatDate } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/pagination";

export type CourseEnrollmentRow = {
  id: string;
  status: string;
  progressPercentage: number;
  startDate: Date;
  endDate: Date;
  user: { id: string; name: string; email: string; company: string | null };
};

const STATUS_OPTIONS = [
  { value: "PAID", label: "Activa" },
  { value: "COMPLETED", label: "Completada" },
  { value: "PENDING", label: "Pendiente" },
  { value: "FAILED", label: "Reprobada" },
  { value: "EXPIRED", label: "Expirada" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PAID: { label: "Activa", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Completada", className: "bg-blue-100 text-blue-700 border-blue-200" },
  PENDING: { label: "Pendiente", className: "bg-muted text-muted-foreground border-border" },
  FAILED: { label: "Reprobada", className: "bg-destructive/10 text-destructive border-destructive/20" },
  EXPIRED: { label: "Expirada", className: "bg-amber-100 text-amber-800 border-amber-200" },
};

const FILTER_PARAMS = ["q", "estado"];

type Props = {
  enrollments: CourseEnrollmentRow[];
  meta: PaginationMeta;
  hasFilters: boolean;
};

export function CourseEnrollmentsTable({ enrollments, meta, hasFilters }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <SearchInput
          placeholder="Buscar por nombre o correo…"
          className="md:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            param="estado"
            options={STATUS_OPTIONS}
            allLabel="Todos los estados"
            placeholder="Estado"
            className="h-9 min-w-[160px]"
          />
          {hasFilters && (
            <ClearFiltersButton params={FILTER_PARAMS} label="Limpiar" />
          )}
        </div>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={hasFilters ? UserSearch : UserCircle}
          title={
            hasFilters
              ? "Ninguna inscripción coincide"
              : "Este curso aún no tiene inscritos"
          }
          description={
            hasFilters
              ? "Prueba con otro nombre, correo o estado."
              : "Los estudiantes aparecerán aquí al inscribirse o cuando los inscribas desde la sección Estudiantes."
          }
          action={
            hasFilters ? <ClearFiltersButton params={FILTER_PARAMS} /> : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3">Estudiante</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Progreso</th>
                    <th className="px-4 py-3">Acceso</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {enrollments.map((enrollment) => {
                    const badge = STATUS_BADGE[enrollment.status] ?? {
                      label: enrollment.status,
                      className: "",
                    };
                    const progress = Math.round(enrollment.progressPercentage);

                    return (
                      <tr
                        key={enrollment.id}
                        className="group transition-colors hover:bg-accent/20"
                      >
                        <td className="px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-xs font-bold text-primary">
                              {enrollment.user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {enrollment.user.name}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground/70">
                                <Mail className="size-3 shrink-0" />
                                <span className="truncate">{enrollment.user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"
                              role="presentation"
                            >
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Calendar className="size-3.5" />
                            <span className="whitespace-nowrap">
                              {formatDate(enrollment.startDate)} → {formatDate(enrollment.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            render={<Link href={`/admin/users/${enrollment.user.id}`} />}
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                          >
                            Ver detalle
                          </Button>
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
            itemLabel={{ one: "inscripción", many: "inscripciones" }}
          />
        </>
      )}
    </div>
  );
}
