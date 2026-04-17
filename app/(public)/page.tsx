import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LandingCourseCard } from "@/components/landing/CourseCard";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Cursos Pro — Plataforma de Capacitación Profesional",
  description:
    "Capacitación certificada en sistemas de gestión, normas ISO y cumplimiento normativo.",
};

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin" : "/student");

  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      _count: { select: { modules: true } },
      modules: { include: { _count: { select: { chapters: true } } } },
    },
  });

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-white to-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1">
            Capacitación certificada · ISO · Cumplimiento normativo
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight max-w-3xl">
            Certifica a tu equipo con{" "}
            <span className="text-primary">cursos profesionales</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Capacitación formal en sistemas de gestión para empresas que requieren
            cumplimiento normativo, preparación para auditorías y respaldo
            documental ante autoridades.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/cursos"
              className={cn(buttonVariants({ size: "lg" }), "px-8 text-base h-12")}
            >
              Ver todos los cursos
            </Link>
            <Link
              href="/registro"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8 text-base h-12")}
            >
              Crear cuenta gratis
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { value: "100%", label: "Cursos con certificado" },
              { value: "180 días", label: "Acceso garantizado" },
              { value: "Verificable", label: "Código único por diploma" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cursos destacados ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Cursos disponibles
            </h2>
            <p className="text-muted-foreground mt-1">
              Contenido actualizado, evaluación incluida y certificado verificable
            </p>
          </div>
          {courses.length > 0 && (
            <Link
              href="/cursos"
              className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:flex text-primary")}
            >
              Ver todos →
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Próximamente nuevos cursos disponibles.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const chapterCount = course.modules.reduce(
                (acc, m) => acc + m._count.chapters,
                0
              );
              return (
                <LandingCourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  price={course.price}
                  thumbnailUrl={course.thumbnailUrl}
                  moduleCount={course._count.modules}
                  chapterCount={chapterCount}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ── Por qué elegirnos ────────────────────────────── */}
      <Separator />
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">
            Diseñado para entornos corporativos y normativos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🏅", title: "Certificado verificable", desc: "Código único que cualquier auditor puede confirmar en línea." },
              { icon: "📋", title: "Contenido normativo", desc: "Cursos alineados a ISO, FSSC, IATF y otros estándares internacionales." },
              { icon: "🔒", title: "Acceso controlado", desc: "180 días de acceso y máximo 2 intentos para mantener la seriedad del proceso." },
              { icon: "📊", title: "Seguimiento de progreso", desc: "Rastrea el avance de tu equipo en tiempo real desde el panel de control." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-border p-6 space-y-3">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-3xl font-bold">¿Listo para certificar a tu equipo?</h2>
          <p className="text-primary-foreground/80 text-lg">
            Crea una cuenta, elige el curso y comienza hoy.
          </p>
          <Link
            href="/registro"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "px-8 h-12 text-base font-semibold")}
          >
            Comenzar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
