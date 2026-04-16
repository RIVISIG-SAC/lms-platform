import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

export default async function StudentHomePage() {
  const session = await getRequiredSession();

  const [enrollments, certificates] = await Promise.all([
    prisma.enrollment.count({
      where: { userId: session.userId, status: { in: ["PAID", "COMPLETED"] } },
    }),
    prisma.certificate.count({
      where: { enrollment: { userId: session.userId }, status: "ACTIVE" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-0.5">
        Bienvenido, {session.name.split(" ")[0]}
      </h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-6">
        Continúa con tu capacitación profesional
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
          <p className="text-sm text-[var(--muted-foreground)]">Cursos Activos</p>
          <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{enrollments}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
          <p className="text-sm text-[var(--muted-foreground)]">Certificados Obtenidos</p>
          <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{certificates}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/student/my-courses"
          className="bg-[var(--primary)] text-white text-sm font-medium px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          Mis Cursos
        </Link>
        <Link
          href="/student/catalog"
          className="border border-[var(--border)] text-[var(--foreground)] text-sm font-medium px-4 py-2.5 rounded-md hover:bg-slate-50 transition-colors"
        >
          Ver Catálogo
        </Link>
      </div>
    </div>
  );
}
