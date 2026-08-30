import { Badge } from '@/components/ui/badge';
import { ImageSlot } from '@/components/public/ImageSlot';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Cpu,
  HardHat,
  Landmark,
  Layers,
  RefreshCcw,
  Search,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
  title: { absolute: 'Quiénes Somos | RIVISIG Consultores' },
  description:
    'Consultora especializada en implementación, certificación y soporte de Sistemas de Gestión ISO orientada a empresas que requieren cumplimiento normativo real.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rivisig.com'}/about`,
  },
};

const problemas = [
  'Obtienen certificaciones que no resisten auditorías reales',
  'Fallan en homologaciones y fiscalizaciones',
  'Cumplen solo de forma documental, sin operación real',
  'Asumen riesgos legales y operativos innecesarios',
];

const pilares = [
  {
    icon: ShieldCheck,
    title: 'Cumplimiento real',
    desc: 'Sistemas que resisten auditorías externas y fiscalizaciones sin depender de documentación vacía.',
  },
  {
    icon: ClipboardList,
    title: 'Enfoque técnico y legal',
    desc: 'Alineados a requisitos normativos, legales y a las exigencias específicas de tus clientes.',
  },
  {
    icon: BookOpen,
    title: 'Capacitación incluida',
    desc: 'Formamos a tu equipo para operar el sistema de forma autónoma, sin dependencia externa.',
  },
  {
    icon: Search,
    title: 'Soporte postcertificación',
    desc: 'Te acompañamos en el mantenimiento del sistema y en renovaciones periódicas.',
  },
];

const sectores = [
  { icon: HardHat, label: 'Construcción' },
  { icon: Building2, label: 'Inmobiliario' },
  { icon: Users, label: 'Servicios especializados' },
  { icon: Cpu, label: 'Tecnología / servicios web' },
  { icon: Landmark, label: 'Empresas proveedoras del Estado' },
  { icon: UtensilsCrossed, label: 'Industria alimentaria' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-linear-to-b from-white via-muted/35 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1"
              >
                Quiénes somos
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-[1.05] tracking-tight mb-5">
                Solidez, confianza y respaldo real en sistemas de gestión
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-xl mb-7">
                Más de una década acompañando a empresas que exigen cumplimiento
                normativo operativo, no solo certificados en papel.
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-xl border border-border bg-white/70 px-4 py-3.5 text-sm max-w-xl">
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <CalendarClock className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">+10</span>{' '}
                  años
                </span>
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <Layers className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    {sectores.length}
                  </span>{' '}
                  sectores
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

            {/* === IMAGE SLOT: Foto institucional / equipo ===
                Archivo esperado: /public/images/about/equipo.webp
                Sugerencia: foto del equipo en oficina, sala de reuniones, o en sitio con cliente.
                Ratio 4/3, mínimo 1200px en el lado mayor. */}
            <div className="relative">
              <ImageSlot
                src="/images/about/equipo.webp"
                alt="Equipo consultor RIVISIG"
                aspect="aspect-[4/3]"
                rounded="rounded-2xl"
                hint="Foto del equipo consultor o de trabajo de campo."
                className="border border-border shadow-xl shadow-black/10"
                priority
              />
              <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-lg">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-4 text-primary" />
                </span>
                <span className="text-xs leading-snug text-foreground/85">
                  <span className="block font-bold text-foreground">
                    Equipo multidisciplinario
                  </span>
                  técnico, legal y operativo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestra propuesta */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Nuestra propuesta
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-[1.12] text-foreground">
              <span className="text-foreground/35">
                No generamos documentos.
              </span>{' '}
              Diseñamos sistemas que funcionan.
            </h2>
          </div>

          <div className="space-y-4 border-l-2 border-primary/20 pl-6 lg:pl-8">
            <p className="text-muted-foreground leading-relaxed">
              Somos una consultora especializada en{' '}
              <strong className="font-semibold text-foreground">
                implementación, certificación y soporte
              </strong>{' '}
              de Sistemas de Gestión, orientada a empresas que requieren
              confianza real, cumplimiento normativo y respaldo ante auditorías,
              clientes y autoridades.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Diseñamos sistemas que resisten auditorías externas y que tu
              equipo puede operar con autonomía, adaptados a tu realidad
              operativa.
            </p>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Pilares de nuestro trabajo
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">
            Lo que nos diferencia
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {pilares.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group">
                <div className="h-px w-full bg-border transition-colors group-hover:bg-primary/50" />
                <span className="mt-5 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* El problema que resolvemos */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                El problema que resolvemos
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-7">
                Muchas empresas obtienen certificaciones que no resisten la
                realidad
              </h2>

              <ul className="border-t border-border">
                {problemas.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 border-b border-border py-3.5 text-sm text-muted-foreground"
                  >
                    <XCircle className="size-4 shrink-0 mt-0.5 text-foreground/30" />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <CheckCircle2 className="size-5 shrink-0 mt-0.5 text-primary" />
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  En RIVISIG cerramos esas brechas. Implementamos sistemas
                  reales, operativos y auditables — no solo documentación.
                </p>
              </div>
            </div>

            {/* === IMAGE SLOT: Proceso de auditoría ===
                Archivo esperado: /public/images/about/auditoria.webp
                Sugerencia: consultor revisando documentos en sitio, o equipo en planta. */}
            <ImageSlot
              src="/images/about/auditoria.webp"
              alt="Consultor RIVISIG realizando auditoría en sitio"
              aspect="aspect-[4/3] lg:aspect-[4/5]"
              rounded="rounded-2xl"
              hint="Foto de trabajo en field o auditoría."
              className="border border-border shadow-xl shadow-black/10"
            />
          </div>
        </div>
      </section>

      {/* Sectores atendidos */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Sectores atendidos
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Experiencia en múltiples industrias
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectores.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-4 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-bold text-foreground">
                  ¿Conversamos sobre tu sistema de gestión?
                </p>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Revisa nuestros servicios de implementación o los cursos de
                  capacitación disponibles en la plataforma.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  href="/servicios"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'group justify-center',
                  )}
                >
                  Ver servicios
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/cursos"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'justify-center',
                  )}
                >
                  Ver cursos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
