import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LandingCourseCard } from "@/components/landing/CourseCard";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ArrowRight, ShieldCheck, Award, CheckCircle2, Phone, Mail } from "lucide-react";

export const metadata = {
  title: "RIVISIG Consultores — Capacitación en Sistemas de Gestión ISO",
  description:
    "Consultora especializada en implementación, certificación y soporte de Sistemas de Gestión. ISO 9001, 14001, 45001, 27001 y más.",
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
      <section className="bg-linear-to-b from-white to-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1">
            Implementación · Certificación · Soporte ISO
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight max-w-3xl">
            Solidez, confianza y{" "}
            <span className="text-primary">respaldo real</span>{" "}
            en sistemas de gestión
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Consultora especializada en implementación, certificación y soporte de Sistemas de Gestión
            orientada a empresas que requieren cumplimiento normativo y respaldo ante auditorías,
            clientes y autoridades.
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
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16">
            {[
              { value: "8+", label: "Normas ISO implementadas" },
              { value: "100%", label: "Cursos con certificado" },
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

      {/* ── Propuesta de valor breve ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Sistemas auditables", desc: "Implementamos sistemas que resisten auditorías externas y fiscalizaciones reales." },
            { icon: Award, title: "Certificación garantizada", desc: "Acompañamiento total desde el diagnóstico hasta la auditoría de certificación." },
            { icon: CheckCircle2, title: "Equipo capacitado", desc: "Formamos a tu equipo para operar el sistema con autonomía, sin dependencia externa." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start">
              <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cursos destacados ────────────────────────────── */}
      <Separator />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Plataforma de capacitación
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Cursos disponibles
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Contenido actualizado, evaluación incluida y certificado verificable.
            </p>
          </div>
          {courses.length > 0 && (
            <Link
              href="/cursos"
              className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:flex items-center gap-1 text-primary")}
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
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

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="bg-foreground text-primary-foreground py-20">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">¿Listo para certificar a tu equipo?</h2>
          <p className="text-primary-foreground/80 text-lg">
            Crea una cuenta, elige el curso y comienza hoy. O contáctanos para una consultoría personalizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "px-8 h-12 text-base font-semibold")}
            >
              Comenzar ahora
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2 text-primary-foreground/70 text-sm">
            <a href="tel:+51965772053" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Phone className="h-4 w-4" />
              +51 965 772 053
            </a>
            <a href="mailto:info@rivisig.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Mail className="h-4 w-4" />
              info@rivisig.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
