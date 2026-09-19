"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Copy,
  GraduationCap,
  Mail,
  MoreVertical,
  UserCircle,
  UserSearch,
} from "lucide-react";
import { toast } from "sonner";
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
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/admin/filters/SearchInput";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import type { PaginationMeta } from "@/lib/pagination";
import {
  EnrollStudentDialog,
  type EnrollCourseOption,
} from "@/components/admin/EnrollStudentDialog";

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  _count: { enrollments: number };
  enrollments: { course: { title: string } }[];
};

type Props = {
  students: StudentRow[];
  courses: EnrollCourseOption[];
  meta: PaginationMeta;
  hasFilters: boolean;
};

export function StudentsTable({ students, courses, meta, hasFilters }: Props) {
  const [enrollStudent, setEnrollStudent] = useState<StudentRow | null>(null);

  function handleCopyEmail(email: string) {
    navigator.clipboard.writeText(email);
    toast.success("Email copiado al portapapeles");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchInput placeholder="Buscar por nombre o correo..." />
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={hasFilters ? UserSearch : UserCircle}
          title={hasFilters ? "Ningún estudiante coincide" : "Aún no hay estudiantes"}
          description={
            hasFilters
              ? "Prueba con otro nombre o dirección de correo."
              : "Los alumnos aparecerán aquí cuando se registren o sean inscritos en un curso."
          }
          action={
            hasFilters ? (
              <ClearFiltersButton params={["q"]} label="Limpiar búsqueda" />
            ) : undefined
          }
        />
      ) : (
        <>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-accent/30">
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3">Última inscripción</th>
                  <th className="px-4 py-3">Cursos</th>
                  <th className="px-4 py-3">Registrado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {students.map((student) => {
                  const lastEnrollment = student.enrollments[0];
                  return (
                    <tr
                      key={student.id}
                      className="group hover:bg-accent/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {student.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-foreground/70 mt-0.5">
                              <Mail className="size-3 shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {lastEnrollment ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <BookOpen className="size-3.5 text-primary shrink-0" />
                            <span className="text-xs font-medium text-foreground truncate max-w-[220px]">
                              {lastEnrollment.course.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">
                            Sin cursos
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={student._count.enrollments > 0 ? "secondary" : "outline"}
                          className="text-[10px] font-semibold"
                        >
                          {student._count.enrollments}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <Calendar className="size-3.5" />
                          <span>
                            {student.createdAt.toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
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
                                render={
                                  <Link
                                    href={`/admin/users/${student.id}?from=students`}
                                  />
                                }
                              >
                                <UserCircle className="size-4" />
                                Ver perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEnrollStudent(student)}>
                                <GraduationCap className="size-4" />
                                Inscribir en curso
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                render={<a href={`mailto:${student.email}`} />}
                              >
                                <Mail className="size-4" />
                                Enviar email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleCopyEmail(student.email)}
                              >
                                <Copy className="size-4" />
                                Copiar email
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

        <Pagination meta={meta} itemLabel={{ one: "estudiante", many: "estudiantes" }} />
        </>
      )}

      <EnrollStudentDialog
        courses={courses}
        prefilledStudent={
          enrollStudent
            ? { id: enrollStudent.id, email: enrollStudent.email, name: enrollStudent.name }
            : null
        }
        open={enrollStudent !== null}
        onOpenChange={(next) => {
          if (!next) setEnrollStudent(null);
        }}
      />
    </div>
  );
}
