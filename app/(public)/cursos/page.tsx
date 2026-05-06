import { LandingCourseCard } from "@/components/landing/CourseCard";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cursos — RIVISIG Consultores",
  description: "Capacitación certificada en sistemas de gestión ISO y cumplimiento normativo.",
};

export default async function CursosPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { modules: true } },
      modules: { include: { _count: { select: { chapters: true } } } },
    },
  });

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-white via-muted/40 to-white">
        <div className="absolute -top-28 -right-20 size-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-36 -left-16 size-80 rounded-full bg-foreground/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 md:pt-18 md:pb-16 relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary">
            Capacitacion profesional con respaldo tecnico
          </Badge>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.02]">
                Catalogo de cursos para cumplir normas, auditar procesos y certificar equipos
              </h1>
              <p className="text-muted-foreground mt-5 text-base max-w-2xl leading-relaxed">
                Programas disenados para convertir requisitos normativos en capacidades reales de trabajo, con evaluacion y evidencia de aprendizaje.
              </p>
            </div>
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-border bg-white/90 backdrop-blur p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Valor academico</p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" /> Certificado con codigo de validacion
                </p>
                <p className="text-sm text-muted-foreground mt-2">Acceso por 180 dias, evaluacion incluida y trazabilidad para sustentar cumplimiento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between gap-3 mb-7">
          <p className="text-sm text-muted-foreground">
            {courses.length} curso{courses.length !== 1 ? "s" : ""} disponible{courses.length !== 1 ? "s" : ""}
          </p>
          <Link
            href="/registro"
            className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
          >
            Comenzar ahora <ArrowRight className="size-4" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-muted/30">
            <p className="text-foreground font-semibold">Estamos preparando nuevos cursos.</p>
            <p className="text-muted-foreground text-sm mt-1">Vuelve pronto para ver nuevas rutas de formacion.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {courses.map((course, index) => {
              const chapterCount = course.modules.reduce(
                (acc, m) => acc + m._count.chapters,
                0
              );
              return (
                <div
                  key={course.id}
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500"
                  style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                >
                  <LandingCourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    price={course.price}
                    thumbnailUrl={course.thumbnailUrl}
                    moduleCount={course._count.modules}
                    chapterCount={chapterCount}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
