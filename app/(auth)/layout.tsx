import Link from "next/link";
import { ArrowLeft, BadgeCheck, MonitorPlay, ShieldCheck } from "lucide-react";
import { SiteLogo } from "@/components/public/SiteLogo";

/**
 * Dos columnas en escritorio: a la izquierda el panel de marca (fijo, no
 * scrollea) y a la derecha el formulario. En móvil solo se ve el formulario,
 * con una barra superior de logo + volver.
 */

const VENTAJAS = [
  {
    icon: BadgeCheck,
    title: "Certificados verificables",
    text: "Cada certificado emitido tiene un código público de verificación.",
  },
  {
    icon: MonitorPlay,
    title: "A tu ritmo, desde donde estés",
    text: "Clases en video, material descargable y progreso guardado automáticamente.",
  },
  {
    icon: ShieldCheck,
    title: "Contenido de auditores en ejercicio",
    text: "Más de una década implementando sistemas de gestión en campo.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-2">
      {/* Panel de marca — solo escritorio */}
      <aside className="hidden border-r border-border bg-muted/30 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <SiteLogo href="/" size="md" />

        <div className="max-w-md py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Campus RIVISIG
          </p>
          <h2 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-foreground xl:text-4xl">
            Formación en sistemas de gestión con respaldo real
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Accede a tus cursos, retoma donde lo dejaste y descarga los
            certificados de los programas que apruebes.
          </p>

          <ul className="mt-10 space-y-6">
            {VENTAJAS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>
            <span className="font-bold text-foreground">+10</span> años de
            experiencia
          </span>
          <span className="hidden h-3 w-px bg-border xl:block" />
          <Link
            href="/verificar"
            className="font-medium transition-colors hover:text-foreground"
          >
            Verificar un certificado
          </Link>
          <span className="hidden h-3 w-px bg-border xl:block" />
          <Link
            href="/cursos"
            className="font-medium transition-colors hover:text-foreground"
          >
            Ver cursos
          </Link>
        </div>
      </aside>

      {/* Columna del formulario */}
      <div className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 lg:hidden">
          <SiteLogo href="/" size="sm" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:py-14">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver al inicio
            </Link>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
