import Link from "next/link";
import { Calendar, Mail, UserCircle, UserSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { UserActiveToggle } from "@/components/admin/UserActiveToggle";
import { SearchInput } from "@/components/admin/filters/SearchInput";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import type { PaginationMeta } from "@/lib/pagination";

const roleBadgeClass: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  STUDENT: "bg-blue-100 text-blue-700 border-blue-200",
  INSTRUCTOR: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  STUDENT: "Estudiante",
  INSTRUCTOR: "Instructor",
};

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "STUDENT", label: "Estudiante" },
  { value: "INSTRUCTOR", label: "Instructor" },
];

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  _count: { enrollments: number };
};

type Props = {
  users: UserRow[];
  activeAdminCount: number;
  meta: PaginationMeta;
  hasFilters: boolean;
};

export function UsersTable({ users, activeAdminCount, meta, hasFilters }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <SearchInput placeholder="Buscar por nombre o correo..." />
        <div className="flex items-center gap-2 md:ml-auto">
          <FilterSelect param="role" options={ROLE_OPTIONS} allLabel="Todos los roles" />
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={hasFilters ? UserSearch : UserCircle}
          title={hasFilters ? "Ningún usuario coincide" : "Sin usuarios"}
          description={
            hasFilters
              ? "Prueba con otro nombre, correo o rol."
              : "Crea el primer usuario desde el botón superior."
          }
          action={
            hasFilters ? (
              <ClearFiltersButton params={["q", "role"]} label="Limpiar búsqueda" />
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
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Cursos</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Registrado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-accent/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {user.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-foreground/70 mt-0.5">
                              <Mail className="size-3 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeClass[user.role] ?? ""}`}
                        >
                          {roleLabel[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user._count.enrollments > 0 ? "secondary" : "outline"}
                          className="text-[10px] font-semibold"
                        >
                          {user._count.enrollments}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <UserActiveToggle
                          userId={user.id}
                          isActive={user.isActive}
                          isLastActiveAdmin={
                            user.role === "ADMIN" &&
                            user.isActive &&
                            activeAdminCount <= 1
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <Calendar className="size-3.5" />
                          <span>
                            {user.createdAt.toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button render={<Link href={`/admin/users/${user.id}`} />} size="sm" variant="ghost" className="text-xs">
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination meta={meta} itemLabel={{ one: "usuario", many: "usuarios" }} />
        </>
      )}
    </div>
  );
}
