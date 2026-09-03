import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { CourseForm } from "@/components/admin/CourseForm";
import { createCourse } from "@/app/actions/courses";

export const metadata = { title: "Nuevo Curso | Instructor" };

export default async function InstructorNewCoursePage() {
  const session = await getSession();
  if (!session || session.role !== "INSTRUCTOR") redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-500">
      <div>
        <Link
          href="/instructor/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Mis cursos
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
          Paso 1 de 3
        </p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Nuevo curso
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Empieza por la ficha del curso. Al guardar entrarás al editor para
          crear los módulos y capítulos. El curso quedará asignado a tu perfil
          de instructor.
        </p>
      </div>

      <CourseForm action={createCourse} />
    </div>
  );
}
