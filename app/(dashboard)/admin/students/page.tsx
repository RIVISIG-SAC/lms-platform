import { prisma } from "@/lib/prisma";
import { StudentsTable } from "@/components/admin/StudentsTable";
import { EnrollStudentDialog } from "@/components/admin/EnrollStudentDialog";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { GraduationCap, Users } from "lucide-react";

export const metadata = { title: "Estudiantes | Admin" };

export default async function AdminStudentsPage() {
  const [students, courses] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { enrollments: true } },
        enrollments: {
          include: { course: { select: { title: true } } },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.course.findMany({
      where: { published: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Estudiantes
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
            Comunidad de estudiantes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {students.length} {students.length === 1 ? "alumno registrado" : "alumnos registrados"}
          </p>
        </div>
        <EnrollStudentDialog
          courses={courses}
          trigger={
            <Button type="button" className="shrink-0">
              <GraduationCap className="size-4" />
              Inscribir estudiante
            </Button>
          }
        />
      </div>

      <StudentsTable students={students} courses={courses} />
    </div>
  );
}
