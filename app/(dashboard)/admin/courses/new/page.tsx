import Link from "next/link";
import { CourseForm } from "@/components/admin/CourseForm";
import { createCourse } from "@/app/actions/courses";

export const metadata = { title: "Nuevo Curso | Admin" };

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-6">
        <Link href="/admin/courses" className="hover:text-[var(--primary)]">
          Cursos
        </Link>
        <span>›</span>
        <span>Nuevo curso</span>
      </div>

      <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-6">
        Crear nuevo curso
      </h1>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <CourseForm action={createCourse} />
      </div>
    </div>
  );
}
