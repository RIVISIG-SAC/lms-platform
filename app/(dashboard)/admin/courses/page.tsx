import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeCourse } from "@/lib/serialize";
import { CoursesTable } from "@/components/admin/CoursesTable";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { FolderOpen, Plus } from "lucide-react";

export const metadata = { title: "Cursos | Admin" };

export default async function AdminCoursesPage() {
  const rawCourses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  const courses = rawCourses.map(serializeCourse);
  const publishedCount = courses.filter((c) => c.published).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Cursos
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4 min-w-0">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <FolderOpen className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Catálogo de cursos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {courses.length} {courses.length === 1 ? "curso" : "cursos"} ·{" "}
              {publishedCount} publicado{publishedCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <Button
          render={<Link href="/admin/courses/new" />}
          nativeButton={false}
          className="shrink-0 shadow-sm"
        >
          <Plus className="size-4" /> Nuevo curso
        </Button>
      </div>

      <CoursesTable courses={courses} />
    </div>
  );
}
