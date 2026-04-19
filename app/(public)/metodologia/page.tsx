import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Metodología — RIVISIG Consultores",
  description:
    "Conoce el proceso de trabajo de RIVISIG: desde el diagnóstico inicial hasta el soporte postcertificación.",
};

const pasos = [
  {
    step: "01",
    title: "Diagnóstico inicial",
    desc: "Realizamos un análisis profundo del estado actual de tu organización frente al estándar seleccionado. Identificamos brechas documentales, operativas y legales para establecer un plan de trabajo claro y realista.",
  },
  {
    step: "02",
    title: "Implementación del sistema",
    desc: "Diseñamos e implementamos el sistema de gestión adaptado a tu realidad operativa. No generamos documentación genérica: cada procedimiento, registro y control responde a cómo funciona realmente tu empresa.",
  },
  {
    step: "03",
    title: "Capacitación y operación",
    desc: "Formamos a tu equipo en los conceptos, herramientas y responsabilidades del sistema. El objetivo es que tu organización opere de forma autónoma, sin depender de consultores externos en el día a día.",
  },
  {
    step: "04",
    title: "Auditoría interna",
    desc: "Realizamos auditorías internas rigurosas para detectar y corregir no conformidades antes de la auditoría de certificación. Este paso es clave para llegar sólidos al proceso externo.",
  },
  {
    step: "05",
    title: "Acompañamiento a auditoría externa",
    desc: "Estamos contigo durante toda la auditoría de certificación: preparamos al equipo, resolvemos consultas del auditor y garantizamos que el sistema sea presentado de la mejor forma posible.",
  },
  {
    step: "06",
    title: "Soporte postcertificación",
    desc: "La certificación es el inicio, no el fin. Te apoyamos en el mantenimiento del sistema, en auditorías de seguimiento y en la renovación trienal, asegurando que el estándar siga vigente y funcional.",
  },
];

const diferenciadores = [
  "Sistemas reales, no solo documentación de cumplimiento",
  "Equipo con experiencia técnica, legal y operativa",
  "Proceso adaptado al tamaño y rubro de tu empresa",
  "Resultados auditables ante cualquier organismo externo",
];

export default function MetodologiaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

      {/* Header */}
      <section>
        <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1">
          Metodología
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-4 max-w-2xl">
          Un proceso claro, de principio a fin
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Acompañamos a tu empresa en cada etapa: desde el primer diagnóstico hasta mantener
          el sistema funcionando mucho después de obtener la certificación.
        </p>
      </section>

      {/* Pasos */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pasos.map((p, i) => (
            <div key={p.step} className="relative bg-white border border-border rounded-xl p-6 space-y-3">
              <span className="text-xs font-bold text-primary/40 tracking-widest">{p.step}</span>
              <h3 className="font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              {i < pasos.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  {(i + 1) % 3 !== 0 && (
                    <ArrowRight className="h-5 w-5 text-border" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Diferenciadores */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Nuestro diferencial
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Cerramos brechas, no solo llenamos formularios
          </h2>
          <div className="space-y-3">
            {diferenciadores.map((d) => (
              <div key={d} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-xl p-8 space-y-4">
          <p className="text-sm font-semibold text-foreground">¿Listo para iniciar?</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Contáctanos para una consulta inicial o revisa los cursos de capacitación
            disponibles en nuestra plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/cursos"
              className={cn(buttonVariants({ size: "sm" }), "justify-center")}
            >
              Ver cursos
            </Link>
            <a
              href="mailto:info@rivisig.com"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-center")}
            >
              Contactar
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
