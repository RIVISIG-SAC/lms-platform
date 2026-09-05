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

export function ProcessTimeline({ index }: { index?: string }) {
  return (
    <section className="emp-grain relative overflow-hidden bg-foreground py-20 text-background sm:py-24">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-1/2 size-[30rem] -translate-y-1/2 rounded-full bg-primary/15 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index={index}
          eyebrow="Metodología RIVISIG"
          tone="ink"
          title={
            <>
              Del diagnóstico a la <span className="text-primary">certificación</span>
            </>
          }
          lead="Siete etapas verificables que aplicamos en todos nuestros proyectos de implementación."
        />

        {/* Desktop: rail horizontal */}
        <ol className="relative mt-16 hidden lg:grid lg:grid-cols-7">
          <div className="absolute inset-x-0 top-[2.6rem] h-px bg-background/15" aria-hidden="true" />
          {STEPS.map(({ label, caption, Icon }, i) => (
            <li key={label} className="group relative flex flex-col items-center px-2 text-center">
              <span className="font-semibold text-[11px] tracking-[0.2em] text-background/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 flex size-14 items-center justify-center rounded-full border border-background/20 bg-foreground transition-colors duration-300 group-hover:border-primary group-hover:bg-primary">
                <Icon className="size-5 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
              </span>
              <span className="mt-4 text-sm font-semibold leading-tight text-background">{label}</span>
              <span className="mt-1.5 text-xs leading-snug text-background/45">{caption}</span>
            </li>
          ))}
        </ol>

        {/* Móvil / tablet: línea vertical */}
        <ol className="relative mt-12 space-y-7 border-l border-background/15 pl-8 lg:hidden">
          {STEPS.map(({ label, caption, Icon }, i) => (
            <li key={label} className="relative">
              <span className="absolute -left-[2.55rem] flex size-10 items-center justify-center rounded-full border border-background/20 bg-foreground">
                <Icon className="size-4 text-primary" />
              </span>
              <span className="font-semibold text-[11px] tracking-[0.2em] text-background/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-1 text-sm font-semibold text-background">{label}</p>
              <p className="mt-0.5 text-xs text-background/45">{caption}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
