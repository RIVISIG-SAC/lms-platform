import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/EmptyState";
import { BookOpen, PlusCircle, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Mis Cursos | Instructor" };

export default async function InstructorCoursesPage() {
  const session = await getSession();
  if (!session || session.role !== "INSTRUCTOR") redirect("/login");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      courses: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { enrollments: true, modules: true } } },
      },
    },
  });

  const courses = profile?.courses ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Mis Cursos
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
          <BookOpen className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Cursos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {courses.length} {courses.length === 1 ? "curso" : "cursos"}
          </p>
        </div>
        <Button render={<Link href="/instructor/courses/new" />} className="shrink-0 gap-2">
          <PlusCircle className="size-4" />
          Nuevo curso
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin cursos"
          description="Crea tu primer curso desde el botón superior."
          action={
            <Button render={<Link href="/instructor/courses/new" />} variant="outline" size="sm" className="gap-2">
              <PlusCircle className="size-4" /> Nuevo curso
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="divide-y divide-border/60">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-foreground truncate">{course.title}</p>
                    <Badge variant={course.published ? "default" : "outline"} className="text-[10px] font-bold shrink-0">
                      {course.published ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{formatCurrency(course.price)}</span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3" /> {course._count.enrollments} estudiante{course._count.enrollments !== 1 ? "s" : ""}
                    </span>
                    <span>{course._count.modules} módulo{course._count.modules !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <Button render={<Link href={`/instructor/courses/${course.id}`} />} size="sm" variant="ghost" className="shrink-0 text-xs">
                  Editar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
