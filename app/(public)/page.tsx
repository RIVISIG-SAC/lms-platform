import { Suspense } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LandingCourseCard } from '@/components/landing/CourseCard';
import { ImageSlot } from '@/components/public/ImageSlot';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Phone,
  Mail,
} from 'lucide-react';
import { getFeaturedCourses } from '@/lib/queries/courses';

export const metadata = {
  title: 'RIVISIG Consultores — Capacitación en Sistemas de Gestión ISO',
  description:
    'Consultora especializada en implementación, certificación y soporte de Sistemas de Gestión. ISO 9001, 14001, 45001, 27001 y más.',
};

async function FeaturedCourses() {
  const courses = await getFeaturedCourses();

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm border border-dashed border-border rounded-2xl bg-white/70">
        Estamos preparando nuevas rutas de formacion.
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-8">
        <Link
          href="/cursos"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'hidden sm:flex items-center gap-1 text-primary rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
          )}
        >
          Ir al catalogo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
        {courses.map((course) => {
          const chapterCount = course.modules.reduce(
            (acc, m) => acc + m._count.chapters,
            0,
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
              instructor={
                course.instructor
                  ? {
                      id: course.instructor.id,
                      name: course.instructor.user.name,
                      avatarUrl: course.instructor.avatarUrl,
                    }
                  : null
              }
            />
          );
        })}
      </div>
    </>
  );
}

function CoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-linear-to-b from-white to-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              <Badge
                variant="outline"
                className="mb-6 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1"
              >
                Implementación · Certificación · Soporte ISO
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.05] tracking-tight">
                Solidez, confianza y{' '}
                <span className="text-primary">respaldo real</span> en sistemas
                de gestión
              </h1>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
                Consultora especializada en implementación, certificación y
                soporte de Sistemas de Gestión orientada a empresas que
                requieren cumplimiento normativo y respaldo ante auditorías,
                clientes y autoridades.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/cursos"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'px-8 text-base h-12',
                  )}
                >
                  Ver todos los cursos
                </Link>
                <Link
                  href="/registro"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'px-8 text-base h-12',
                  )}
                >
                  Crear cuenta gratis
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
                {[
                  { value: '8+', label: 'Normas ISO implementadas' },
                  { value: '100%', label: 'Cursos con certificado' },
                  { value: 'Verificable', label: 'Código único por diploma' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {s.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* === IMAGE SLOT: Hero principal ===
                Archivo esperado: /public/images/hero.jpg
                Sugerencia: foto profesional de equipo consultor, sala de capacitación,
                o auditoría en planta. Ratio 4/3 o 3/4, mínimo 1200px lado mayor. */}
            <div className="relative">
              <ImageSlot
                src="/images/hero.jpg"
                alt="Equipo RIVISIG en proceso de auditoría"
                aspect="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]"
                rounded="rounded-2xl"
                priority
                hint="Foto hero: equipo consultor, sala de auditoría o capacitación corporativa."
                className="shadow-xl"
              />
              {/* Card flotante con sello de confianza */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white rounded-xl border border-border shadow-lg p-4 items-center gap-3 max-w-xs">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    Certificaciones auditables
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Respaldadas ante organismos externos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Clientes / Logos de confianza ────────────────── */}
      <section className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            Empresas que confían en nosotros
          </p>
          {/* === IMAGE SLOTS: Logos de clientes ===
              Archivos esperados: /public/images/clients/cliente-1.png … cliente-6.png
              Formato: PNG con fondo transparente, en escala de grises o monocromo.
              Tamaño sugerido: 240 × 80 px. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ImageSlot
                key={i}
                src={`/images/clients/cliente-${i}.webp`}
                alt={`Cliente ${i}`}
                aspect="aspect-[2/1]"
                rounded="rounded-md"
                cover={false}
                className="bg-transparent border-dashed grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all"
                hint={`Logo cliente ${i}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Cursos destacados ────────────────────────────── */}

      <section className="relative overflow-hidden border-y border-border bg-linear-to-b from-white via-muted/30 to-white">
        <div className="absolute -top-20 right-0 size-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Plataforma de capacitacion
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              Formacion tecnica para equipos que deben cumplir y evidenciar resultados
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
              Cursos estructurados por modulos, evaluacion incluida y certificado verificable para fortalecer auditorias, clientes y procesos internos.
            </p>
          </div>
          <Suspense fallback={<CoursesSkeleton />}>
            <FeaturedCourses />
          </Suspense>
        </div>
      </section>

      {/* ── Propuesta de valor ───────────────────────────── */}
      <Separator />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Por qué RIVISIG
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Cumplimiento real, no solo documentación
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: 'Sistemas auditables',
              desc: 'Implementamos sistemas que resisten auditorías externas y fiscalizaciones reales.',
            },
            {
              icon: Award,
              title: 'Certificación garantizada',
              desc: 'Acompañamiento total desde el diagnóstico hasta la auditoría de certificación.',
            },
            {
              icon: CheckCircle2,
              title: 'Equipo capacitado',
              desc: 'Formamos a tu equipo para operar el sistema con autonomía, sin dependencia externa.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="relative bg-foreground text-primary-foreground overflow-hidden">
        {/* === IMAGE SLOT: Fondo decorativo CTA (opcional) ===
            Archivo esperado: /public/images/cta-bg.jpg
            Foto oscura, de ambiente profesional. Se superpone un overlay. */}
        <div className="absolute inset-0 opacity-10">
          <ImageSlot
            src="/images/cta-bg.jpg"
            alt=""
            aspect="h-full"
            rounded="rounded-none"
            className="h-full border-0"
            hint="Fondo decorativo"
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Activa hoy una ruta de capacitacion con impacto medible
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Crea una cuenta, elige un curso y empieza en minutos. Si necesitas un plan corporativo, te ayudamos a disenar una ruta personalizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'lg' }),
                'px-8 h-12 text-base font-semibold',
              )}
            >
              Comenzar ahora
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 text-primary-foreground/70 text-sm">
            <a
              href="tel:+51965772053"
              className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
            >
              <Phone className="h-4 w-4" />
              +51 965 772 053
            </a>
            <a
              href="mailto:info@rivisig.com"
              className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              info@rivisig.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
