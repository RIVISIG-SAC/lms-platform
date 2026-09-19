"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Calendar,
  Copy,
  ExternalLink,
  Files,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { deleteCompany, duplicateCompany } from "@/app/actions/empresas";
import { POST_STATUSES, POST_STATUS_LABELS, type PostStatusValue } from "@/lib/validations/empresas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/admin/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/admin/filters/SearchInput";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import type { PaginationMeta } from "@/lib/pagination";

export type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  sector: string | null;
  logoUrl: string | null;
  status: PostStatusValue;
  publishedAt: Date | null;
  updatedAt: Date;
};

const STATUS_BADGE: Record<PostStatusValue, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SCHEDULED: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200",
  PUBLISHED: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300",
};

const STATUS_OPTIONS = POST_STATUSES.map((s) => ({
  value: s,
  label: POST_STATUS_LABELS[s],
}));

type Props = {
  companies: CompanyRow[];
  meta: PaginationMeta;
  hasFilters: boolean;
};

export function CompaniesTable({ companies, meta, hasFilters }: Props) {
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado al portapapeles");
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateCompany(id);
    if ("error" in res) toast.error(res.error);
    else toast.success("Empresa duplicada como borrador");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchInput
          placeholder="Buscar por nombre, slug o rubro…"
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
          {hasFilters && (
            <ClearFiltersButton params={["q", "status"]} label="Limpiar" />
          )}
        </div>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={hasFilters ? "Ninguna empresa coincide con los filtros" : "Aún no hay empresas"}
          description={
            hasFilters
              ? "Prueba cambiando los criterios de búsqueda."
              : "Crea el primer caso de éxito y empieza a publicar."
          }
          action={
            hasFilters ? (
              <ClearFiltersButton params={["q", "status"]} />
            ) : (
              <Link href="/admin/empresas/new" className="text-sm font-semibold text-primary hover:underline">
                Crear la primera empresa →
              </Link>
            )
          }
        />
      ) : (
        <>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-accent/30">
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Rubro</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Publicación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {companies.map((company) => (
                  <tr key={company.id} className="group hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-12 w-16 rounded-md bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                          {company.logoUrl ? (
                            <Image
                              src={company.logoUrl}
                              alt={company.name}
                              width={64}
                              height={48}
                              className="object-contain size-full p-1"
                              unoptimized
                            />
                          ) : (
                            <Building2 className="size-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[320px]">
                          <Link
                            href={`/admin/empresas/${company.id}/edit`}
                            className="font-semibold text-foreground truncate group-hover:text-primary transition-colors block"
                          >
                            {company.name}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
                            /empresas/{company.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {company.sector ? (
                        <Badge variant="outline" className="gap-1 text-[10px] font-semibold w-fit">
                          {company.sector}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          STATUS_BADGE[company.status],
                        )}
                      >
                        {POST_STATUS_LABELS[company.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {company.publishedAt ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <Calendar className="size-3.5" />
                          <span>{formatDate(company.publishedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Link
                          href={`/admin/empresas/${company.id}/edit`}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-xs font-semibold hover:text-primary hover:border-primary/40 transition-colors"
                        >
                          <Pencil className="size-3.5" /> Editar
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button type="button" variant="ghost" size="icon-sm" aria-label="Más acciones">
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem render={<Link href={`/admin/empresas/${company.id}/edit`} />}>
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            {company.status === "PUBLISHED" && (
                              <DropdownMenuItem
                                render={
                                  <Link href={`/empresas/${company.slug}`} target="_blank" rel="noopener noreferrer" />
                                }
                              >
                                <ExternalLink className="size-4" />
                                Ver público
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(company.id)}>
                              <Files className="size-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyId(company.id)}>
                              <Copy className="size-4" />
                              Copiar ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              render={
                                <DeleteConfirmDialog
                                  action={deleteCompany.bind(null, company.id)}
                                  title="¿Eliminar empresa?"
                                  description={`Se eliminará permanentemente "${company.name}".`}
                                  triggerLabel="Eliminar empresa"
                                  successMessage="Empresa eliminada"
                                  variant="link"
                                  triggerClassName="w-full flex items-center gap-1.5 text-sm text-destructive text-left"
                                />
                              }
                            >
                              <Trash2 className="size-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination meta={meta} itemLabel={{ one: "empresa", many: "empresas" }} />
        </>
      )}
    </div>
  );
}
