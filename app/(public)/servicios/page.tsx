import { Badge } from '@/components/ui/badge';
import { ImageSlot } from '@/components/public/ImageSlot';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Layers,
  Leaf,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
  title: { absolute: 'Servicios de Consultoría ISO | RIVISIG' },
  description:
    'Implementación y certificación ISO 9001, 14001, 45001, 27001, 37001, 21001, 22000, 50001. Homologaciones, SST y auditorías técnicas.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rivisig.com'}/servicios`,
  },
};

const normas = [
  {
    norma: 'ISO 9001',
    nombre: 'Sistema de Gestión de la Calidad',
    desc: 'Mejora continua de procesos y satisfacción del cliente en cualquier tipo de organización.',
  },
  {
    norma: 'ISO 14001',
    nombre: 'Sistema de Gestión Ambiental',
    desc: 'Control y reducción del impacto ambiental, cumplimiento legal y sostenibilidad operativa.',
  },
  {
    norma: 'ISO 45001',
    nombre: 'Seguridad y Salud en el Trabajo',
    desc: 'Prevención de riesgos laborales y cumplimiento normativo ante SUNAFIL y autoridades.',
  },
  {
    norma: 'ISO 37001',
    nombre: 'Sistema de Gestión Antisoborno',
    desc: 'Controles para prevenir, detectar y responder ante el soborno en la organización.',
  },
  {
    norma: 'ISO 27001',
    nombre: 'Seguridad de la Información',
    desc: 'Protección de activos de información, datos sensibles y continuidad del negocio.',
  },
  {
    norma: 'ISO 21001',
    nombre: 'Organizaciones Educativas',
    desc: 'Sistema de gestión para instituciones educativas orientado a la mejora del aprendizaje.',
  },
  {
    norma: 'ISO 22000',
    nombre: 'Inocuidad de los Alimentos',
    desc: 'Control de peligros en la cadena alimentaria y cumplimiento de requisitos sanitarios.',
  },
  {
    norma: 'ISO 50001',
    nombre: 'Sistema de Gestión de Energía',
    desc: 'Eficiencia energética, reducción de costos y cumplimiento de objetivos de sostenibilidad.',
  },
];

const serviciosAdicionales = [
  {
    icon: Award,
    title: 'Soporte para Homologaciones',
    items: [
      'Preparación y revisión de requisitos de homologación',
      'Alineamiento de sistemas de gestión a exigencias del cliente',
      'Soporte documental y técnico',
      'Acompañamiento en procesos de evaluación',
    ],
    imgKey: 'homologaciones',
  },
  {
    icon: Leaf,
    title: 'Seguridad y Salud en el Trabajo – Ley 29783',
    items: [
      'Implementación y soporte del SG-SST',
      'Diagnóstico de cumplimiento legal',
      'Elaboración y actualización de IPERC, planes SST, procedimientos y registros',
      'Inducciones, charlas obligatorias y capacitación a supervisores',
      'Enfoque práctico alineado a fiscalizaciones SUNAFIL',
    ],
    imgKey: 'sst',
  },
  {
    icon: Users,
    title: 'Auditorías y Evaluaciones Técnicas',
    items: [
      'Auditorías internas y de segunda parte',
      'Evaluación de proveedores y contratistas',
      'Diagnóstico de brechas normativas',
      'Revisión de cumplimiento legal y contractual',
    ],
    imgKey: 'auditorias',
  },
];

export default function ServiciosPage() {
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
                Servicios
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-[1.05] tracking-tight mb-5">
                Implementación y certificación ISO
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-xl mb-7">
                Trabajamos con los principales estándares internacionales de
                sistemas de gestión, de forma individual o integrada
                (multinorma). Acompañamiento total desde el diagnóstico hasta la
                auditoría externa.
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-xl border border-border bg-white/70 px-4 py-3.5 text-sm max-w-xl">
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <Layers className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    {normas.length}
                  </span>{' '}
                  normas ISO
                </span>
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <ShieldCheck className="size-4 text-primary" />
                  Enfoque{' '}
                  <span className="font-semibold text-foreground">
                    multinorma
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <Award className="size-4 text-primary" />
                  Hasta la{' '}
                  <span className="font-semibold text-foreground">
                    auditoría externa
                  </span>
                </span>
              </div>
            </div>

            {/* === IMAGE SLOT: Banner de servicios ===
                Archivo esperado: /public/images/servicios/banner.webp
                Sugerencia: foto de consultoría en planta, sala de reuniones o capacitación corporativa. */}
            <div className="relative">
              <ImageSlot
                src="/images/servicios/banner.webp"
                alt="Consultoría RIVISIG en sitio"
                aspect="aspect-[4/3]"
                rounded="rounded-2xl"
                className="border border-border shadow-xl shadow-black/10"
                hint="Banner página de servicios."
                priority
              />
              <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-lg">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="size-4 text-primary" />
                </span>
                <span className="text-xs leading-snug text-foreground/85">
                  <span className="block font-bold text-foreground">
                    {normas.length} estándares
                  </span>
                  implementados por RIVISIG
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Normas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Normas que implementamos
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Estándares internacionales ISO
            </h2>
          </div>
          <p className="text-sm text-muted-foreground sm:text-right sm:max-w-xs">
            Cada estándar se implementa por separado o de forma integrada en un
            solo sistema multinorma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {normas.map((s) => (
            <div
              key={s.norma}
              className="group flex flex-col rounded-xl border border-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <p className="text-xl font-black tracking-tight text-primary">
                {s.norma}
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                {s.nombre}
              </p>
              <div className="my-3 h-px w-full bg-border transition-colors group-hover:bg-primary/30" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios complementarios */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Servicios complementarios
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12 lg:mb-16">
            Soporte técnico y operativo
          </h2>

          <div className="space-y-16 lg:space-y-24">
            {serviciosAdicionales.map(
              ({ icon: Icon, title, items, imgKey }, i) => (
                <div
                  key={title}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
                >
                  {/* === IMAGE SLOT: Servicio complementario ===
                      Archivo esperado: /public/images/servicios/{imgKey}.webp
                      Una foto representativa por cada servicio. */}
                  <div
                    className={cn('relative', i % 2 === 1 && 'lg:order-2')}
                  >
                    <ImageSlot
                      src={`/images/servicios/${imgKey}.webp`}
                      alt={title}
                      aspect="aspect-[4/3]"
                      rounded="rounded-2xl"
                      className="border border-border shadow-xl shadow-black/10"
                      hint={`Imagen servicio: ${title}`}
                    />
                    <span className="absolute -top-4 -left-4 hidden sm:inline-flex size-12 items-center justify-center rounded-xl border border-border bg-white text-sm font-black tracking-widest text-primary shadow-lg">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div>
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-xl sm:text-2xl font-bold leading-snug text-foreground">
                      {title}
                    </h3>
                    <ul className="mt-6 space-y-3 border-t border-border pt-5">
                      {items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                        >
                          <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ),
            )}
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
                  ¿No sabes qué norma necesita tu empresa?
                </p>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Revisa cómo trabajamos en cada etapa del proceso o empieza por
                  los cursos de capacitación disponibles en la plataforma.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  href="/metodologia"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'group justify-center',
                  )}
                >
                  Ver metodología
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
