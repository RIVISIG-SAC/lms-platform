import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { BuyButton } from "@/components/landing/BuyButton";
import { enrollFree } from "@/app/actions/enrollments";
import { VimeoPlayer } from "@/components/student/VimeoPlayer";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Clock,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";
import type { CourseDetail } from "./types";

type SessionLike = { userId: string } | null;

type Props = {
  course: CourseDetail;
  chapterCount: number;
  previewVideoId: string | null;
  session: SessionLike;
  isPaid: boolean;
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Básico",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

const INCLUDES = (durationHours: number | null) =>
  [
    { icon: ShieldCheck, label: "Ruta completa por módulos" },
    { icon: Award, label: "Certificado verificable" },
    durationHours ? { icon: Clock, label: `${durationHours} horas de contenido` } : null,
    { icon: Smartphone, label: "Acceso multidispositivo" },
  ].filter(Boolean) as { icon: typeof ShieldCheck; label: string }[];

export function CoursePreviewHero({
  course,
  chapterCount,
  previewVideoId,
  session,
  isPaid,
}: Props) {
  const instructorName = course.instructor?.user.name;
  const instructorInitial = instructorName?.trim().charAt(0).toUpperCase() ?? "?";
  const levelLabel = course.level ? LEVEL_LABEL[course.level] : null;
  const includes = INCLUDES(course.durationHours);

  return (
    <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-white via-muted/35 to-white">
      <div className="absolute -top-28 -right-20 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 lg:pt-14 lg:pb-10 relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* ── Info ── */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {course.category && (
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                  {course.category}
                </Badge>
              )}
              <Badge variant="outline" className="text-foreground/70 border-border bg-white">
                {course.isFree ? "Acceso gratuito · Certificado con costo" : "Certificación al aprobar"}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-[1.05] tracking-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {course.description}
            </p>

            {instructorName && (
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/80 py-1.5 pl-1.5 pr-4">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {instructorInitial}
                </span>
                <span className="text-sm text-foreground/85">
                  Por <span className="font-semibold text-foreground">{instructorName}</span>
                  {course.instructor?.title ? ` · ${course.instructor.title}` : ""}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 bg-white/70 px-4 py-3.5 text-sm">
              {levelLabel && (
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <BarChart3 className="size-4 text-primary" />
                  Nivel <span className="font-semibold text-foreground">{levelLabel}</span>
                </span>
              )}
              {course.durationHours ? (
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <Clock className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">{course.durationHours}h</span> de contenido
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <BookOpen className="size-4 text-primary" />
                <span className="font-semibold text-foreground">{chapterCount}</span> clase{chapterCount !== 1 ? "s" : ""}
              </span>
              {course._count.enrollments > 0 && (
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <Users className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">{course._count.enrollments.toLocaleString("es-PE")}</span> estudiantes
                </span>
              )}
            </div>

            {/* Highlights de inclusión */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                Este curso incluye
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {includes.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-white/80 px-3 py-2.5"
                  >
                    <span className="inline-flex shrink-0 size-7 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-3.5 text-primary" />
                    </span>
                    <span className="text-[13px] leading-snug text-foreground/85">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Purchase / preview card ── */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5 bg-white">
              {previewVideoId ? (
                <div className="relative">
                  <VimeoPlayer videoId={previewVideoId} title={`Preview de ${course.title}`} />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide bg-black/65 text-white backdrop-blur px-2.5 py-1 rounded-full">
                    <PlayCircle className="size-3.5" /> Preview
                  </span>
                </div>
              ) : course.thumbnailUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                      <PlayCircle className="size-7 text-primary" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video bg-linear-to-br from-primary/80 to-primary flex items-center justify-center">
                  <BookOpen className="size-14 text-white/30" />
                </div>
              )}

              <div className="h-1 bg-linear-to-r from-primary via-primary/60 to-primary/20" />

              <div className="p-6 space-y-5">
                {course.isFree ? (
                  <div>
                    <p className="text-3xl font-bold text-green-600">Gratis</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Acceso por 180 días · Certificado S/. {Number(course.certificateFee ?? 0).toFixed(2)} al aprobar
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-foreground tracking-tight">
                      {formatCurrency(course.price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pago único · Acceso por 180 días · Certificado incluido
                    </p>
                  </div>
                )}

                {isPaid ? (
                  <Link
                    href={`/student/courses/${course.id}`}
                    className={cn(buttonVariants(), "w-full h-11 justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2")}
                  >
                    Ir al curso <ArrowRight className="size-4" />
                  </Link>
                ) : course.isFree ? (
                  session ? (
                    <form action={enrollFree.bind(null, course.id)}>
                      <button
                        type="submit"
                        className="w-full h-11 bg-green-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Inscribirse gratis
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={`/login?next=/cursos/${course.id}`}
                      className={cn(buttonVariants(), "w-full h-11 justify-center focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2")}
                    >
                      Iniciar sesión para inscribirse
                    </Link>
                  )
                ) : session ? (
                  <BuyButton courseId={course.id} price={Number(course.price)} />
                ) : (
                  <Link
                    href={`/registro?next=/cursos/${course.id}`}
                    className={cn(buttonVariants(), "w-full h-11 justify-center focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2")}
                  >
                    Comprar ahora
                  </Link>
                )}

                {!session && (
                  <p className="text-xs text-center text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                      href={`/login?next=/cursos/${course.id}`}
                      className="text-primary font-semibold hover:underline"
                    >
                      Inicia sesión
                    </Link>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/40">
                {[
                  { icon: ShieldCheck, label: "Pago seguro" },
                  { icon: Zap, label: "Acceso inmediato" },
                  { icon: Award, label: "Certificado digital" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 px-2 py-3 text-center">
                    <Icon className="size-4 text-primary" />
                    <span className="text-[11px] font-medium leading-tight text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
