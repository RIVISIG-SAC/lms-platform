import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Cursos</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            {courses.length} {courses.length === 1 ? "curso" : "cursos"} en total
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-[var(--primary)] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          + Nuevo Curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12 text-center">
          <p className="text-[var(--muted-foreground)] mb-4">No hay cursos todavía.</p>
          <Link
            href="/admin/courses/new"
            className="bg-[var(--primary)] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-slate-50">
                <th className="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium">Curso</th>
                <th className="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium">Precio</th>
                <th className="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium">Módulos</th>
                <th className="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium">Inscritos</th>
                <th className="text-left px-4 py-3 text-[var(--muted-foreground)] font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--foreground)]">{course.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-1">
                      {course.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {formatCurrency(course.price)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {course._count.modules}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {course._count.enrollments}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        course.published
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {course.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-[var(--primary)] hover:underline text-sm"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
