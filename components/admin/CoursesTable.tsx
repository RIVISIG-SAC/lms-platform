"use client";

import Link from "next/link";
import Image from "next/image";
import type { CourseLevel } from "@prisma/client";
import type { SerializedCourse } from "@/lib/serialize";
import {
  BookX,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Layers,
  MoreVertical,
  Pencil,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { deleteCourse } from "@/app/actions/courses";
import { formatCurrency } from "@/lib/utils";
import {
  COURSE_LEVELS,
  COURSE_LEVEL_LABELS,
  type CourseLevelValue,
} from "@/lib/validations/course";
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
import { SegmentedFilter } from "@/components/admin/filters/SegmentedFilter";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import type { PaginationMeta } from "@/lib/pagination";

export type CourseRow = SerializedCourse & {
  _count: { enrollments: number; modules: number };
};

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
];

const LEVEL_OPTIONS = COURSE_LEVELS.map((l) => ({
  value: l,
  label: COURSE_LEVEL_LABELS[l as CourseLevelValue],
}));

type Props = {
  courses: CourseRow[];
  meta: PaginationMeta;
  hasFilters: boolean;
};

export function CoursesTable({ courses, meta, hasFilters }: Props) {
  function handleCopyId(id: string) {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado al portapapeles");
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchInput
          placeholder="Buscar por título, descripción o categoría..."
          className="md:max-w-sm"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <SegmentedFilter param="status" options={STATUS_OPTIONS} />
          <FilterSelect
            param="level"
            options={LEVEL_OPTIONS}
            allLabel="Todos los niveles"
            placeholder="Nivel"
          />
        </div>
      </div>

      {/* Table */}
      {courses.length === 0 ? (
        <EmptyState
          icon={BookX}
          title={hasFilters ? "Ningún curso coincide con los filtros" : "No hay cursos disponibles"}
          description={
            hasFilters
              ? "Prueba cambiando los criterios de búsqueda para ver más resultados."
              : "Empieza a crear tu biblioteca de contenido. Puedes diseñar tu primer curso en minutos."
          }
          action={
            hasFilters ? (
              <ClearFiltersButton params={["q", "status", "level"]} />
            ) : (
              <Link
                href="/admin/courses/new"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Crear el primer curso →
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
                  <th className="px-4 py-3">Curso</th>
                  <th className="px-4 py-3">Clasificación</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Contenido</th>
                  <th className="px-4 py-3">Inscritos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {courses.map((course) => {
                  const levelLabel = course.level
                    ? COURSE_LEVEL_LABELS[course.level as CourseLevel]
                    : null;
                  return (
                    <tr
                      key={course.id}
                      className="group hover:bg-accent/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-12 w-16 rounded-md bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            {course.thumbnailUrl ? (
                              <Image
                                src={course.thumbnailUrl}
                                alt={course.title}
                                width={64}
                                height={48}
                                className="object-cover size-full"
                                unoptimized
                              />
                            ) : (
                              <Eye className="size-4 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[280px]">
                            <Link
                              href={`/admin/courses/${course.id}`}
                              className="font-semibold text-foreground truncate group-hover:text-primary transition-colors block"
                            >
                              {course.title}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {course.description || "Sin descripción"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {course.category && (
                            <Badge variant="outline" className="gap-1 text-[10px] font-semibold w-fit">
                              <Tag className="size-3" /> {course.category}
                            </Badge>
                          )}
                          {levelLabel && (
                            <Badge variant="secondary" className="text-[10px] font-semibold w-fit">
                              {levelLabel}
                            </Badge>
                          )}
                          {course.durationHours != null && (
                            <Badge variant="outline" className="gap-1 text-[10px] font-semibold w-fit">
                              <Clock className="size-3" /> {course.durationHours} h
                            </Badge>
                          )}
                          {!course.category && !levelLabel && course.durationHours == null && (
                            <span className="text-xs text-muted-foreground/60">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-sm">
                          {formatCurrency(course.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <Layers className="size-3.5" />
                          <span>{course._count.modules} módulos</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <Users className="size-3.5" />
                          <span>{course._count.enrollments}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={course.published ? "default" : "outline"}
                          className="text-[10px] font-semibold uppercase"
                        >
                          {course.published ? "Público" : "Borrador"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Link
                            href={`/admin/courses/${course.id}`}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-xs font-semibold hover:text-primary hover:border-primary/40 transition-colors"
                          >
                            <Pencil className="size-3.5" /> Editar
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Más acciones"
                                >
                                  <MoreVertical className="size-4" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem
                                render={<Link href={`/admin/courses/${course.id}`} />}
                              >
                                <Pencil className="size-4" />
                                Editar curso
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                render={
                                  <Link
                                    href={`/cursos/${course.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  />
                                }
                              >
                                <ExternalLink className="size-4" />
                                Ver como estudiante
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyId(course.id)}>
                                <Copy className="size-4" />
                                Copiar ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                render={
                                  <DeleteConfirmDialog
                                    action={deleteCourse.bind(null, course.id)}
                                    title="¿Eliminar curso?"
                                    description={`Se eliminará "${course.title}" junto con todos sus módulos, capítulos e inscripciones.`}
                                    triggerLabel="Eliminar curso"
                                    successMessage="Curso eliminado"
                                    variant="link"
                                    triggerClassName="w-full flex items-center gap-1.5 text-sm text-destructive text-left"
                                  />
                                }
                              >
                                <Trash2 className="size-4" />
                                Eliminar curso
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination meta={meta} itemLabel={{ one: "curso", many: "cursos" }} />
        </>
      )}
    </div>
  );
}
