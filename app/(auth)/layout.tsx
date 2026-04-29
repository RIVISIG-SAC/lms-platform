import Link from "next/link";
import { SiteLogo } from "@/components/public/SiteLogo";
import { ShieldCheck, Award, Users, ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ── Left: Brand Panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        {/* Logo */}
        <SiteLogo variant="white" href="/" />

        {/* Middle content */}
        <div className="space-y-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-snug">
              Plataforma de Capacitación y Certificación Corporativa
            </h2>
            <p className="text-primary-foreground/75 leading-relaxed text-sm">
              Accede a cursos especializados en Sistemas de Gestión ISO, impartidos
              por consultores con experiencia real en auditoría y certificación internacional.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="space-y-4">
            {[
              {
                Icon: ShieldCheck,
                title: "Contenido certificado",
                sub: "ISO 9001 · 14001 · 45001 · 27001",
              },
              {
                Icon: Award,
                title: "Certificados reconocidos",
                sub: "Válidos ante auditorías y organismos reguladores",
              },
              {
                Icon: Users,
                title: "+300 empresas capacitadas",
                sub: "En sectores industrial, salud y servicios",
              },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-primary-foreground/65">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <blockquote className="border-l-2 border-white/25 pl-4">
            <p className="text-sm text-primary-foreground/75 italic leading-relaxed">
              "La capacitación profesional no es un gasto, es la inversión más
              rentable que puede hacer una organización hacia la excelencia operativa."
            </p>
            <footer className="mt-2 text-xs text-primary-foreground/50">
              — RIVISIG Consultores
            </footer>
          </blockquote>
        </div>

        {/* Footer */}
        <p className="text-xs text-primary-foreground/40 relative z-10">
          © {new Date().getFullYear()} RIVISIG Consultores. Todos los derechos reservados.
        </p>
      </div>

      {/* ── Right: Form Panel ─────────────────────────────── */}
      <div className="flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-border">
          <SiteLogo href="/" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Desktop back link */}
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Volver al inicio
            </Link>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
