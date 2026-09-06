import {
  BadgeCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Search,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

/**
 * Bloque estructural: idéntico en todas las empresas (no depende de datos).
 * Ver decisiones de diseño de la sección Empresas.
 */
const STEPS: { label: string; caption: string; Icon: LucideIcon }[] = [
  { label: "Diagnóstico", caption: "Brechas frente al estándar", Icon: Search },
  { label: "Planificación", caption: "Plan de trabajo y alcance", Icon: ClipboardList },
  { label: "Diseño documental", caption: "Procesos a la medida", Icon: FileText },
  { label: "Capacitación", caption: "Equipo autónomo", Icon: GraduationCap },
  { label: "Implementación", caption: "Sistema en operación", Icon: Settings },
  { label: "Auditoría interna", caption: "Hallazgos y correcciones", Icon: ShieldCheck },
  { label: "Certificación", caption: "Auditoría externa", Icon: BadgeCheck },
];

export function ProcessTimeline() {
  return (
    <section className="border-y border-border bg-linear-to-b from-white via-muted/40 to-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Metodología RIVISIG"
          title={
            <>
              Del diagnóstico a la <span className="text-primary">certificación</span>
            </>
          }
          lead="Siete etapas verificables que aplicamos en todos nuestros proyectos de implementación."
        />

        {/* Desktop: rail horizontal */}
        <ol className="relative mt-16 hidden lg:grid lg:grid-cols-7">
          <div className="absolute inset-x-0 top-[2.6rem] h-px bg-border" aria-hidden="true" />
          {STEPS.map(({ label, caption, Icon }, i) => (
            <li key={label} className="group relative flex flex-col items-center px-2 text-center">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 size-14 rounded-full bg-white">
                <span className="flex size-full items-center justify-center rounded-full border border-primary/20 bg-primary/10 transition-colors duration-300 group-hover:border-primary group-hover:bg-primary">
                  <Icon className="size-6 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                </span>
              </span>
              <span className="mt-4 text-sm font-semibold leading-tight text-foreground">{label}</span>
              <span className="mt-1.5 text-xs leading-snug text-muted-foreground">{caption}</span>
            </li>
          ))}
        </ol>

        {/* Móvil / tablet: línea vertical */}
        <ol className="relative mt-12 space-y-7 border-l border-border pl-8 lg:hidden">
          {STEPS.map(({ label, caption, Icon }, i) => (
            <li key={label} className="relative">
              <span className="absolute -left-[2.55rem] size-10 rounded-full bg-white">
                <span className="flex size-full items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </span>
              </span>
              <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
