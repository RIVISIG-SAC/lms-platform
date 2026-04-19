"use client";

import { useMemo, useState } from "react";
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
  Search,
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/admin/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

export type CourseRow = SerializedCourse & {
  _count: { enrollments: number; modules: number };
};

type StatusFilter = "all" | "published" | "draft";
type LevelFilter = CourseLevelValue | "all";

type Props = {
  courses: CourseRow[];
};

export function CoursesTable({ courses }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (q) {
        const haystack = `${c.title} ${c.description} ${c.category ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (status === "published" && !c.published) return false;
      if (status === "draft" && c.published) return false;
      if (level !== "all" && c.level !== level) return false;
      return true;
    });
  }, [courses, query, status, level]);

  const hasFilters = query.length > 0 || status !== "all" || level !== "all";

  function handleCopyId(id: string) {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado al portapapeles");
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Buscar por título, descripción o categoría..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
            {(
              [
                { v: "all", label: "Todos" },
                { v: "published", label: "Publicados" },
                { v: "draft", label: "Borradores" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setStatus(opt.v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  status === opt.v
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Select
            value={level}
            onValueChange={(v) => setLevel(v as LevelFilter)}
          >
            <SelectTrigger className="h-9 min-w-[140px]">
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              {COURSE_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {COURSE_LEVEL_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setLevel("all");
                }}
              >
                Limpiar filtros
              </Button>
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
                {filtered.map((course) => {
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
                                    href={`/cursos/${course.id}`}
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
      )}
    </div>
  );
}
