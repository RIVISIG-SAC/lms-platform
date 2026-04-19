import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeCourse } from "@/lib/serialize";
import { CourseForm } from "@/components/admin/CourseForm";
import { ModuleAccordion } from "@/components/admin/modules/ModuleAccordion";
import { AddModuleButton } from "@/components/admin/modules/AddModuleButton";
import { deleteCourse, updateCourse } from "@/app/actions/courses";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { ExamManager } from "@/components/admin/ExamManager";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { COURSE_LEVEL_LABELS, type CourseLevelValue } from "@/lib/validations/course";
import { BookOpen, Clock, FileText, GraduationCap, Layers, Tag } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

type Props = { params: Promise<{ courseId: string }> };

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  return { title: course ? `${course.title} | Admin` : "Curso | Admin" };
}

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: { resources: { orderBy: { createdAt: "asc" } } },
          },
        },
      },
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });

  if (!course) notFound();

  const totalChapters = course.modules.reduce((acc, m) => acc + m.chapters.length, 0);
  const levelLabel = course.level
    ? COURSE_LEVEL_LABELS[course.level as CourseLevelValue]
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/courses" />}>Cursos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[260px] truncate normal-case tracking-normal font-medium">
              {course.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4 min-w-0">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant={course.published ? "default" : "outline"}
                className="font-semibold"
              >
                {course.published ? "Publicado" : "Borrador"}
              </Badge>
              <Badge variant="secondary" className="font-semibold">
                {formatCurrency(course.price)}
              </Badge>
              {course.category && (
                <Badge variant="outline" className="gap-1 font-semibold">
                  <Tag className="size-3" /> {course.category}
                </Badge>
              )}
              {levelLabel && (
                <Badge variant="outline" className="font-semibold">
                  {levelLabel}
                </Badge>
              )}
              {course.durationHours != null && (
                <Badge variant="outline" className="gap-1 font-semibold">
                  <Clock className="size-3" /> {course.durationHours} h
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <DeleteConfirmDialog
            action={deleteCourse.bind(null, course.id)}
            title="¿Eliminar curso?"
            description={`Se eliminará "${course.title}" junto con todos sus módulos, capítulos, recursos e inscripciones.`}
            triggerLabel="Eliminar curso"
            successMessage="Curso eliminado"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="h-11 bg-muted/70 p-1">
          <TabsTrigger value="info" className="px-4 gap-2">
            <FileText className="size-4" />
            Información
          </TabsTrigger>
          <TabsTrigger value="content" className="px-4 gap-2">
            <Layers className="size-4" />
            Contenido
            <Badge variant="outline" className="ml-1 text-[10px] font-semibold">
              {course.modules.length} · {totalChapters}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="exam" className="px-4 gap-2">
            <GraduationCap className="size-4" />
            Evaluación
            <Badge variant="outline" className="ml-1 text-[10px] font-semibold">
              {course.questions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Info Tab ─────────────────────────────────────── */}
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardContent className="p-6 md:p-8">
              <CourseForm action={updateCourse} course={serializeCourse(course)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Content Tab ──────────────────────────────────── */}
        <TabsContent value="content" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Estructura del curso</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Organiza los módulos y capítulos que verán los estudiantes.
                </p>
              </div>
              <AddModuleButton
                courseId={course.id}
                nextOrder={course.modules.length}
              />
            </div>

            {course.modules.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="Aún no hay módulos"
                description="Los cursos se organizan en módulos y, dentro de cada módulo, capítulos. Empieza creando el primer módulo."
                action={
                  <AddModuleButton
                    courseId={course.id}
                    nextOrder={0}
                    variant="ghost"
                  />
                }
              />
            ) : (
              <div className="space-y-3">
                {course.modules.map((mod) => (
                  <ModuleAccordion key={mod.id} mod={mod} courseId={course.id} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Exam Tab ─────────────────────────────────────── */}
        <TabsContent value="exam" className="mt-6">
          <Card>
            <CardContent className="p-6 md:p-8">
              <ExamManager courseId={course.id} questions={course.questions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
