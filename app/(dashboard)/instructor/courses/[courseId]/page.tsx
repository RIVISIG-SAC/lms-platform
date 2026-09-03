import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, FileText, GraduationCap, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { serializeCourse } from "@/lib/serialize";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseEditHeader } from "@/components/admin/CourseEditHeader";
import { ModuleAccordion } from "@/components/admin/modules/ModuleAccordion";
import { AddModuleButton } from "@/components/admin/modules/AddModuleButton";
import { deleteCourse, updateCourse } from "@/app/actions/courses";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { ExamManager } from "@/components/admin/ExamManager";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = { params: Promise<{ courseId: string }> };

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  return {
    title: course ? `${course.title} | Instructor` : "Curso | Instructor",
  };
}

export default async function InstructorEditCoursePage({ params }: Props) {
  const { courseId } = await params;
  const session = await getSession();
  if (!session || session.role !== "INSTRUCTOR") redirect("/login");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.userId },
  });

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
      _count: { select: { enrollments: true } },
    },
  });

  if (!course || course.instructorId !== profile?.id) notFound();

  const totalChapters = course.modules.reduce(
    (acc: number, m) => acc + m.chapters.length,
    0,
  );

  // Número de clase global con el que arranca cada módulo
  const inicioPorModulo = course.modules.map(
    (_, i) =>
      course.modules
        .slice(0, i)
        .reduce((total, m) => total + m.chapters.length, 0) + 1,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-500">
      <Link
        href="/instructor/courses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Mis cursos
      </Link>

      <CourseEditHeader
        courseId={course.id}
        title={course.title}
        published={course.published}
        price={Number(course.price)}
        isFree={course.isFree}
        category={course.category}
        level={course.level}
        durationHours={course.durationHours}
        modules={course.modules.length}
        chapters={totalChapters}
        questions={course.questions.length}
        students={course._count.enrollments}
        actions={
          <DeleteConfirmDialog
            action={deleteCourse.bind(null, course.id)}
            title="¿Eliminar curso?"
            description={`Se eliminará "${course.title}" junto con todos sus módulos, capítulos y recursos.`}
            triggerLabel="Eliminar curso"
            successMessage="Curso eliminado"
          />
        }
      />

      <Tabs defaultValue="info">
        <TabsList className="h-13 w-full justify-start gap-1 overflow-x-auto bg-muted p-1.5">
          <TabsTrigger value="info" className="flex-none gap-2 px-5 text-sm font-semibold">
            <FileText className="size-4.5" />
            Información
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-none gap-2 px-5 text-sm font-semibold">
            <Layers className="size-4.5" />
            Contenido
            <Badge variant="outline" className="ml-1 text-[11px] font-bold tabular-nums">
              {course.modules.length} · {totalChapters}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="exam" className="flex-none gap-2 px-5 text-sm font-semibold">
            <GraduationCap className="size-4.5" />
            Evaluación
            <Badge variant="outline" className="ml-1 text-[11px] font-bold tabular-nums">
              {course.questions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <CourseForm action={updateCourse} course={serializeCourse(course)} />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <section className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Estructura del curso
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {course.modules.length === 0
                    ? "Organiza el contenido en módulos y, dentro de cada uno, capítulos."
                    : `${course.modules.length} ${course.modules.length === 1 ? "módulo" : "módulos"} · ${totalChapters} ${totalChapters === 1 ? "capítulo" : "capítulos"} en total.`}
                </p>
              </div>
              {course.modules.length > 0 && (
                <AddModuleButton
                  courseId={course.id}
                  nextOrder={course.modules.length}
                />
              )}
            </div>

            {course.modules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
                <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="size-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  Aún no hay módulos
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Los cursos se organizan en módulos y, dentro de cada módulo,
                  capítulos con video y material descargable.
                </p>
                <div className="mx-auto mt-6 max-w-xs">
                  <AddModuleButton
                    courseId={course.id}
                    nextOrder={0}
                    variant="ghost"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {course.modules.map((mod, i) => (
                  <ModuleAccordion
                    key={mod.id}
                    mod={mod}
                    courseId={course.id}
                    claseInicial={inicioPorModulo[i]}
                  />
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="exam" className="mt-6">
          <ExamManager courseId={course.id} questions={course.questions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
