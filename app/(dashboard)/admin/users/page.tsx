import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "@/components/admin/UsersTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

export const metadata = { title: "Usuarios | Admin" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Usuarios
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
          <Users className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestión de usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} {users.length === 1 ? "usuario registrado" : "usuarios registrados"}
          </p>
        </div>
        <Button render={<Link href="/admin/users/new" />} className="shrink-0 gap-2">
          <UserPlus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
