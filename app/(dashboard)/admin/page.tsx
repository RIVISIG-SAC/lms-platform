import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [courses, students, certificates] = await Promise.all([
    prisma.course.count({ where: { published: true } }),
    prisma.enrollment.count({ where: { status: { in: ["PAID", "COMPLETED"] } } }),
    prisma.certificate.count({ where: { status: "ACTIVE" } }),
  ]);

  const recentCourses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-0.5">
          Panel Administrativo
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Resumen general de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Cursos Publicados", value: courses, href: "/admin/courses" },
          { label: "Inscripciones Activas", value: students, href: "/admin/students" },
          { label: "Certificados Emitidos", value: certificates, href: "/admin/students" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5 hover:shadow-sm transition-shadow"
          >
            <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Cursos recientes</h2>
          <Link href="/admin/courses" className="text-xs text-[var(--primary)] hover:underline">
            Ver todos
          </Link>
        </div>
        {recentCourses.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
            No hay cursos todavía.{" "}
            <Link href="/admin/courses/new" className="text-[var(--primary)] hover:underline">
              Crear uno
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recentCourses.map((course) => (
              <li key={course.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{course.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {course._count.enrollments} inscripciones
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${course.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {course.published ? "Publicado" : "Borrador"}
                  </span>
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="text-xs text-[var(--primary)] hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
