import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/admin/CourseForm";
import { ModuleAccordion } from "@/components/admin/ModuleAccordion";
import { AddModuleForm } from "@/components/admin/AddModuleForm";
import { deleteCourse, updateCourse } from "@/app/actions/courses";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ExamManager } from "@/components/admin/ExamManager";
import { formatCurrency } from "@/lib/utils";

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
        include: { chapters: { orderBy: { order: "asc" } } },
      },
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/admin/courses" className="hover:text-[var(--primary)]">
          Cursos
        </Link>
        <span>›</span>
        <span className="text-[var(--foreground)] font-medium truncate max-w-xs">
          {course.title}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            {course.title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-[var(--muted-foreground)]">
              {formatCurrency(course.price)}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                course.published
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {course.published ? "Publicado" : "Borrador"}
            </span>
          </div>
        </div>
        <DeleteButton
          action={deleteCourse.bind(null, course.id)}
          label="Eliminar curso"
          confirmMessage={`¿Eliminar "${course.title}"? Se eliminarán todos sus módulos, capítulos e inscripciones.`}
        />
      </div>

      {/* Course Info */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-base font-medium text-[var(--foreground)] mb-5">
          Información del curso
        </h2>
        <CourseForm action={updateCourse} course={course} />
      </section>

      {/* Modules & Chapters */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-[var(--foreground)]">
            Contenido del curso
          </h2>
          <span className="text-sm text-[var(--muted-foreground)]">
            {course.modules.length} módulos ·{" "}
            {course.modules.reduce((acc, m) => acc + m.chapters.length, 0)} capítulos
          </span>
        </div>

        <div className="space-y-3">
          {course.modules.map((mod) => (
            <ModuleAccordion key={mod.id} mod={mod} courseId={course.id} />
          ))}

          <AddModuleForm courseId={course.id} nextOrder={course.modules.length} />
        </div>
      </section>

      {/* Exam */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <ExamManager courseId={course.id} questions={course.questions} />
      </section>
    </div>
  );
}
