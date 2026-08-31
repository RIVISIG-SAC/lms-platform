import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Layers,
  PlayCircle,
  User,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  COURSE_LEVEL_LABELS,
  type CourseLevelValue,
} from "@/lib/validations/course";

type Precio = number | string | { toNumber(): number };

type InstructorInfo = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type Props = {
  id: string;
  title: string;
  description: string;
  price: Precio;
  isFree?: boolean;
  certificateFee?: Precio | null;
  thumbnailUrl?: string | null;
  category?: string | null;
  level?: string | null;
  durationHours?: number | null;
  moduleCount: number;
  chapterCount: number;
  instructor?: InstructorInfo | null;
};

/** Días de acceso que concede la inscripción (ver lib/enrollments). */
const DIAS_ACCESO = 180;

function aNumero(valor: Precio) {
  if (typeof valor === "object" && "toNumber" in valor) return valor.toNumber();
  return Number(valor);
}

function Meta({
  icon: Icon,
  children,
}: {
  icon: typeof Layers;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 text-primary" />
      {children}
    </span>
  );
}

export function LandingCourseCard({
  id,
  title,
  description,
  price,
  isFree = false,
  certificateFee,
  thumbnailUrl,
  category,
  level,
  durationHours,
  moduleCount,
  chapterCount,
  instructor,
}: Props) {
  const levelLabel = level
    ? COURSE_LEVEL_LABELS[level as CourseLevelValue]
    : null;

  // Un curso marcado como gratuito, o cuyo precio es 0, no se cobra.
  // Solo el modelo `isFree` cobra el certificado aparte.
  const gratuito = isFree || aNumero(price) <= 0;

  return (
    <Link
      href={`/cursos/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      {/* Portada, sin superposiciones: muchas imágenes ya traen texto */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/5">
            <BookOpen className="size-10 text-primary/30" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {(category || levelLabel) && (
          <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-widest">
            {category && <span className="text-primary">{category}</span>}
            {category && levelLabel && (
              <span className="text-border">·</span>
            )}
            {levelLabel && (
              <span className="text-muted-foreground">{levelLabel}</span>
            )}
          </p>
        )}

        <h3 className="text-base font-black leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-lg">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground">
          <Meta icon={Layers}>
            {moduleCount} {moduleCount === 1 ? "módulo" : "módulos"}
          </Meta>
          <Meta icon={PlayCircle}>
            {chapterCount} {chapterCount === 1 ? "clase" : "clases"}
          </Meta>
          {durationHours != null && durationHours > 0 && (
            <Meta icon={Clock}>{durationHours} h</Meta>
          )}
        </div>

        {instructor && (
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
            {instructor.avatarUrl ? (
              <Image
                src={instructor.avatarUrl}
                alt=""
                width={24}
                height={24}
                className="size-6 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                <User className="size-3 text-primary" />
              </span>
            )}
            <span className="truncate text-xs text-muted-foreground">
              {instructor.name}
            </span>
          </div>
        )}

        {/* El pie se ancla abajo para que las tarjetas queden alineadas */}
        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {gratuito ? "Inscripción" : "Inversión"}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-2xl font-black leading-none tracking-tight",
                  gratuito ? "text-emerald-700" : "text-foreground",
                )}
              >
                {gratuito ? "Gratis" : formatCurrency(price)}
              </p>
              <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
                {isFree
                  ? certificateFee != null
                    ? `Certificado ${formatCurrency(certificateFee)}`
                    : "Certificado con costo aparte"
                  : "Certificado incluido al aprobar"}
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              Ver detalle
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            {DIAS_ACCESO} días de acceso desde la inscripción
          </p>
        </div>
      </div>
    </Link>
  );
}
