"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Calendar,
  Copy,
  Mail,
  MoreVertical,
  Search,
  UserCircle,
  UserSearch,
} from "lucide-react";
import { toast } from "sonner";
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
import { EmptyState } from "@/components/admin/EmptyState";

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
};

export function StudentsTable({ students }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const haystack = `${s.name} ${s.email}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [students, query]);

  function handleCopyEmail(email: string) {
    navigator.clipboard.writeText(email);
    toast.success("Email copiado al portapapeles");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Buscar por nombre o correo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="ml-auto text-xs font-semibold text-muted-foreground">
          {filtered.length} de {students.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={query ? UserSearch : UserCircle}
          title={query ? "Ningún estudiante coincide" : "Aún no hay estudiantes"}
          description={
            query
              ? "Prueba con otro nombre o dirección de correo."
              : "Los alumnos aparecerán aquí cuando se registren o sean inscritos en un curso."
          }
          action={
            query ? (
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                Limpiar búsqueda
              </Button>
            ) : undefined
          }
        />
      ) : (
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
                {filtered.map((student) => {
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
                              <DropdownMenuItem disabled>
                                <UserCircle className="size-4" />
                                Ver perfil
                                <Badge
                                  variant="outline"
                                  className="ml-auto text-[9px] font-semibold uppercase"
                                >
                                  Próximamente
                                </Badge>
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
      )}
    </div>
  );
}
