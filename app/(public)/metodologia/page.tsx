import { Badge } from '@/components/ui/badge';
import { ImageSlot } from '@/components/public/ImageSlot';
import {
  ArrowRight,
  Award,
  ClipboardCheck,
  Layers,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
  title: { absolute: 'Metodología de Implementación ISO | RIVISIG' },
  description:
    'Conoce el proceso de trabajo de RIVISIG: desde el diagnóstico inicial hasta el soporte postcertificación.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rivisig.com'}/metodologia`,
  },
};

const pasos = [
  {
    step: '01',
    title: 'Diagnóstico inicial',
    desc: 'Realizamos un análisis profundo del estado actual de tu organización frente al estándar seleccionado. Identificamos brechas documentales, operativas y legales para establecer un plan de trabajo claro y realista.',
  },
  {
    step: '02',
    title: 'Implementación del sistema',
    desc: 'Diseñamos e implementamos el sistema de gestión adaptado a tu realidad operativa. No generamos documentación genérica: cada procedimiento, registro y control responde a cómo funciona realmente tu empresa.',
  },
  {
    step: '03',
    title: 'Capacitación y operación',
    desc: 'Formamos a tu equipo en los conceptos, herramientas y responsabilidades del sistema. El objetivo es que tu organización opere de forma autónoma, sin depender de consultores externos en el día a día.',
  },
  {
    step: '04',
    title: 'Auditoría interna',
    desc: 'Realizamos auditorías internas rigurosas para detectar y corregir no conformidades antes de la auditoría de certificación. Este paso es clave para llegar sólidos al proceso externo.',
  },
  {
    step: '05',
    title: 'Acompañamiento a auditoría externa',
    desc: 'Estamos contigo durante toda la auditoría de certificación: preparamos al equipo, resolvemos consultas del auditor y garantizamos que el sistema sea presentado de la mejor forma posible.',
  },
  {
    step: '06',
    title: 'Soporte postcertificación',
    desc: 'La certificación es el inicio, no el fin. Te apoyamos en el mantenimiento del sistema, en auditorías de seguimiento y en la renovación trienal, asegurando que el estándar siga vigente y funcional.',
  },
];

const diferenciadores = [
  {
    icon: Workflow,
    title: 'Sistemas que operan',
    desc: 'Sistemas reales, no solo documentación de cumplimiento.',
  },
  {
    icon: Users,
    title: 'Equipo multidisciplinario',
    desc: 'Experiencia técnica, legal y operativa en una sola mesa de trabajo.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Proceso a medida',
    desc: 'Adaptado al tamaño, al rubro y al ritmo real de tu empresa.',
  },
  {
    icon: ClipboardCheck,
    title: 'Resultados auditables',
    desc: 'Evidencia que sostiene la revisión de cualquier organismo externo.',
  },
];

export default function MetodologiaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-white via-muted/35 to-white">
        <div className="absolute -top-28 -right-20 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1"
              >
                Metodología
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-[1.05] tracking-tight mb-5">
                Un proceso claro, de principio a fin
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-xl mb-7">
                Acompañamos a tu empresa en cada etapa: desde el primer
                diagnóstico hasta mantener el sistema funcionando mucho después
                de obtener la certificación.
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-xl border border-border bg-white/70 px-4 py-3.5 text-sm max-w-xl">
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <Layers className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    {pasos.length}
                  </span>{' '}
                  etapas
                </span>
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <ShieldCheck className="size-4 text-primary" />
                  Proceso{' '}
                  <span className="font-semibold text-foreground">
                    a medida
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <RefreshCcw className="size-4 text-primary" />
                  Soporte{' '}
                  <span className="font-semibold text-foreground">
                    postcertificación
                  </span>
                </span>
              </div>
            </div>

            {/* === IMAGE SLOT: Visual de proceso / metodología ===
                Archivo esperado: /public/images/metodologia/proceso.jpg
                Sugerencia: foto de consultor presentando plan a cliente, pizarra con flujo,
                o infografía del proceso de certificación. */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-linear-to-br from-primary/15 via-primary/5 to-transparent blur-2xl" />
              <ImageSlot
                src="/images/metodologia/proceso.webp"
                alt="Proceso metodológico RIVISIG"
                aspect="aspect-[4/3]"
                rounded="rounded-2xl"
                className="border border-border shadow-xl shadow-black/10"
                hint="Visual de metodología: pizarra, diagrama o consultor explicando."
              />
              <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-lg">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="size-4 text-primary" />
                </span>
                <span className="text-xs leading-snug text-foreground/85">
                  <span className="block font-bold text-foreground">
                    {pasos.length} etapas
                  </span>
                  de principio a fin
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pasos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          Las 6 etapas
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Cómo trabajamos contigo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pasos.map((p, i) => (
            <div
              key={p.step}
              className="relative bg-white border border-border rounded-xl p-6 space-y-3 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex gap-2 items-center mb-1">
                <span className="text-md font-bold text-primary/40 tracking-widest">
                  {p.step}
                </span>
                <h3 className="font-semibold text-foreground">{p.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.desc}
              </p>
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

      {/* Diferenciadores + CTA */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            {/* Copy + tarjetas */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                <Sparkles className="size-3.5" />
                Nuestro diferencial
              </span>

              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[2.6rem] font-black leading-[1.08] tracking-tight text-foreground">
                Cerramos brechas,{' '}
                <span className="text-foreground/35">
                  no solo llenamos formularios
                </span>
              </h2>

              <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
                Cada entregable está diseñado para sostenerse en el tiempo y
                resistir la revisión de un auditor externo, no para llenar una
                carpeta.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {diferenciadores.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-border bg-white p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* === IMAGE SLOT: Resultado / certificado entregado ===
                Archivo esperado: /public/images/metodologia/certificacion.webp
                Sugerencia: foto de entrega de certificado, reconocimiento, o handshake empresarial. */}
            <div className="relative">
              <ImageSlot
                src="/images/metodologia/certificacion.webp"
                alt="Entrega de certificación a empresa cliente"
                aspect="aspect-[4/3] lg:aspect-[4/5]"
                rounded="rounded-2xl"
                className="border border-border shadow-xl shadow-black/10"
                hint="Foto de certificación entregada / hito de cierre."
              />
              <div className="absolute -bottom-5 left-5 right-5 sm:right-auto flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-lg">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="size-4 text-primary" />
                </span>
                <span className="text-xs leading-snug text-foreground/85">
                  <span className="block font-bold text-foreground">
                    Certificación acompañada
                  </span>
                  y sostenida después del sello
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 lg:mt-24 rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-bold text-foreground">
                  ¿Listo para iniciar?
                </p>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Contáctanos para una consulta inicial o revisa los cursos de
                  capacitación disponibles en nuestra plataforma.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  href="/cursos"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'group justify-center',
                  )}
                >
                  Ver cursos
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/servicios"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'justify-center',
                  )}
                >
                  Ver servicios
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
