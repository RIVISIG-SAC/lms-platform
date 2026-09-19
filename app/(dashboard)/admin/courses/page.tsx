import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeCourse } from "@/lib/serialize";
import { COURSE_LEVELS } from "@/lib/validations/course";
import {
  buildPagination,
  getEnumParam,
  getPageSize,
  getRequestedPage,
  getSearchParam,
  type SearchParamsRecord,
} from "@/lib/pagination";
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

export default async function AdminCoursesPage(props: {
  searchParams: Promise<unknown>;
}) {
  const sp = (await props.searchParams) as SearchParamsRecord;
  const q = getSearchParam(sp, "q");
  const status = getEnumParam(sp, "status", ["published", "draft"] as const);
  const level = getEnumParam(sp, "level", COURSE_LEVELS);

  const where: Prisma.CourseWhereInput = {
    ...(status !== "all" ? { published: status === "published" } : {}),
    ...(level !== "all" ? { level } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalItems, totalCourses, publishedCount] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.count(),
    prisma.course.count({ where: { published: true } }),
  ]);

  const meta = buildPagination({
    requestedPage: getRequestedPage(sp),
    pageSize: getPageSize(sp),
    totalItems,
  });

  const rawCourses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.pageSize,
    include: {
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  const courses = rawCourses.map(serializeCourse);

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
              {totalCourses} {totalCourses === 1 ? "curso" : "cursos"} ·{" "}
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

      <CoursesTable
        courses={courses}
        meta={meta}
        hasFilters={Boolean(q) || status !== "all" || level !== "all"}
      />
    </div>
  );
}
