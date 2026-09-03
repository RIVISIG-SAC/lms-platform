import Link from "next/link";
import {
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  Tag,
  Users,
} from "lucide-react";
import { CoursePublishToggle } from "@/components/admin/CoursePublishToggle";
import { formatCurrency, cn } from "@/lib/utils";
import {
  COURSE_LEVEL_LABELS,
  type CourseLevelValue,
} from "@/lib/validations/course";

type Props = {
  courseId: string;
  title: string;
  published: boolean;
  price: number;
  isFree: boolean;
  category: string | null;
  level: string | null;
  durationHours: number | null;
  modules: number;
  chapters: number;
  questions: number;
  /** Solo lo pasa el admin: el instructor no consulta inscripciones. */
  students?: number;
  actions: React.ReactNode;
};

/**
 * Cabecera del editor de curso: identidad, publicación y las cifras que dicen
 * si el curso está listo para salir al catálogo.
 */
export function CourseEditHeader({
  courseId,
  title,
  published,
  price,
  isFree,
  category,
  level,
  durationHours,
  modules,
  chapters,
  questions,
  students,
  actions,
}: Props) {
  const levelLabel = level
    ? COURSE_LEVEL_LABELS[level as CourseLevelValue]
    : null;
  const incompleto = chapters === 0 || questions === 0;

  const cifras = [
    { icon: Layers, label: "Módulos", value: modules, alerta: modules === 0 },
    {
      icon: Layers,
      label: "Capítulos",
      value: chapters,
      alerta: chapters === 0,
    },
    {
      icon: GraduationCap,
      label: "Preguntas",
      value: questions,
      alerta: questions === 0,
    },
    ...(students != null
      ? [{ icon: Users, label: "Inscritos", value: students, alerta: false }]
      : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Editor de curso
          </p>
          <h1 className="mt-1.5 text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">
              {isFree ? "Gratuito" : formatCurrency(price)}
            </span>
            {category && (
              <span className="inline-flex items-center gap-1.5">
                <Tag className="size-3.5" />
                {category}
              </span>
            )}
            {levelLabel && <span>{levelLabel}</span>}
            {durationHours != null && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {durationHours} h
              </span>
            )}
            {published && (
              <Link
                href={`/cursos/${courseId}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
                Ver ficha pública
              </Link>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          <CoursePublishToggle
            courseId={courseId}
            published={published}
            incompleto={incompleto}
          />
          {actions}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-3",
          cifras.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3",
        )}
      >
        {cifras.map(({ icon: Icon, label, value, alerta }) => (
          <div
            key={label}
            className={cn(
              "rounded-xl border p-3 sm:p-4",
              alerta ? "border-amber-200 bg-amber-50/50" : "border-border bg-card",
            )}
          >
            <div className="flex items-center gap-2">
              <Icon
                className={cn(
                  "size-3.5",
                  alerta ? "text-amber-600" : "text-muted-foreground",
                )}
              />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
            <p
              className={cn(
                "mt-1.5 text-2xl font-black tabular-nums tracking-tight",
                alerta ? "text-amber-700" : "text-foreground",
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {!published && incompleto && (
        <p className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-800">
          Antes de publicar:{" "}
          {chapters === 0 && <strong>añade capítulos con contenido</strong>}
          {chapters === 0 && questions === 0 && " y "}
          {questions === 0 && (
            <strong>crea las preguntas de la evaluación</strong>
          )}
          . Sin evaluación los estudiantes no pueden obtener el certificado.
        </p>
      )}
    </div>
  );
}
