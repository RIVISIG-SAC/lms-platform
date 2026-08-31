"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  CalendarDays,
  Clock,
  DollarSign,
  EyeOff,
  Gift,
  ImageIcon,
  Infinity as InfinityIcon,
  Loader2,
  Save,
  Tag,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { SerializedCourse } from "@/lib/serialize";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import {
  InstructorSelect,
  type InstructorOption,
} from "@/components/admin/InstructorSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  COURSE_LEVELS,
  COURSE_LEVEL_LABELS,
  VALIDITY_OPTIONS,
  type CourseLevelValue,
} from "@/lib/validations/course";
import { AREA_ADMIN, CONTROL_ADMIN } from "@/components/admin/form-styles";
import { addDays, cn, formatDate } from "@/lib/utils";

type ActionState = { error?: string; success?: boolean } | null;
type CourseAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

type Props = {
  action: CourseAction;
  course?: SerializedCourse;
  instructors?: InstructorOption[];
};

const MAX_TITULO = 120;
const MAX_DESCRIPCION = 2000;
const MAX_CERT_DESC = 400;


/** Vigencia del certificado: sin vencimiento, valores estándar o libre. */
type Vigencia = "none" | "custom" | number;

function Seccion({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function Campo({
  id,
  label,
  hint,
  className,
  children,
}: {
  id?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint}
    </div>
  );
}

/** Contador de caracteres que avisa al acercarse al límite. */
function Contador({ valor, max }: { valor: number; max: number }) {
  return (
    <span
      className={cn(
        "shrink-0 text-[11px] tabular-nums",
        valor > max * 0.9
          ? "font-semibold text-amber-700"
          : "text-muted-foreground",
      )}
    >
      {valor}/{max}
    </span>
  );
}

/** Grupo de opciones excluyentes en forma de chips. */
function Chips<T extends string | number>({
  name,
  value,
  onChange,
  options,
  legend,
}: {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  legend: string;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">{legend}</legend>
      {options.map((opt) => {
        const activo = value === opt.value;
        return (
          <label
            key={String(opt.value)}
            className={cn(
              "relative inline-flex min-h-10 cursor-pointer items-center rounded-xl border px-4 text-sm transition-all",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
              activo
                ? "border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary/30"
                : "border-border font-medium text-foreground hover:border-primary/30 hover:bg-accent/40",
            )}
          >
            <input
              type="radio"
              name={name}
              checked={activo}
              onChange={() => onChange(opt.value)}
              className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
            />
            {opt.label}
          </label>
        );
      })}
    </fieldset>
  );
}

/** Tarjeta de opción excluyente, con icono y consecuencia explicada. */
function OpcionCard({
  icon: Icon,
  label,
  description,
  activo,
  onSelect,
  name,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  activo: boolean;
  onSelect: () => void;
  name: string;
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-all",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
        activo
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border hover:border-primary/30 hover:bg-accent/40",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={activo}
        onChange={onSelect}
        className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
      />
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg transition-colors",
          activo
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <span
        className={cn(
          "text-sm font-bold",
          activo ? "text-primary" : "text-foreground",
        )}
      >
        {label}
      </span>
      <span className="text-[11px] leading-relaxed text-muted-foreground">
        {description}
      </span>
    </label>
  );
}

export function CourseForm({ action, course, instructors = [] }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [certDescription, setCertDescription] = useState(
    course?.certificateDescription ?? "",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl ?? "");
  const [level, setLevel] = useState<CourseLevelValue | "">(
    (course?.level as CourseLevelValue | null) ?? "",
  );
  const [isFree, setIsFree] = useState(course?.isFree ?? false);

  const [vigencia, setVigencia] = useState<Vigencia>(() => {
    const v = course?.certificateValidityDays;
    if (v == null) return "none";
    return VALIDITY_OPTIONS.some((o) => o.value === v) ? v : "custom";
  });
  const [customDays, setCustomDays] = useState(() => {
    const v = course?.certificateValidityDays;
    if (v == null || VALIDITY_OPTIONS.some((o) => o.value === v)) return "";
    return String(v);
  });

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success("Cambios guardados correctamente");
  }, [state]);

  const dias =
    vigencia === "none"
      ? null
      : vigencia === "custom"
        ? Number(customDays) || null
        : vigencia;
  const vence = dias && dias >= 1 && dias <= 3650 ? addDays(new Date(), dias) : null;

  return (
    <form action={formAction} className="space-y-5">
      {course && <input type="hidden" name="id" value={course.id} />}

      <Seccion
        icon={Type}
        title="Identidad del curso"
        description="Lo primero que ve un estudiante en el catálogo."
      >
        <div className="space-y-5">
          <Campo
            id="title"
            label="Título"
            hint={
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Claro y específico: incluye la norma o el tema principal.
                </p>
                <Contador valor={title.length} max={MAX_TITULO} />
              </div>
            }
          >
            <Input
              id="title"
              name="title"
              required
              minLength={3}
              maxLength={MAX_TITULO}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Implementación de ISO 9001:2015"
              className={CONTROL_ADMIN}
            />
          </Campo>

          <Campo
            id="description"
            label="Descripción"
            hint={
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Objetivo, alcance y a quién va dirigido. Mínimo 10 caracteres.
                </p>
                <Contador valor={description.length} max={MAX_DESCRIPCION} />
              </div>
            }
          >
            <Textarea
              id="description"
              name="description"
              required
              rows={5}
              minLength={10}
              maxLength={MAX_DESCRIPCION}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resume el objetivo, el alcance y el público objetivo del curso."
              className={cn(AREA_ADMIN, "min-h-32")}
            />
          </Campo>

          <Campo
            label={
              <span className="inline-flex items-center gap-1.5">
                <ImageIcon className="size-3.5" />
                Imagen de portada
              </span>
            }
            hint={
              <p className="text-[11px] text-muted-foreground">
                Formato horizontal (16:9). JPG, PNG o WEBP hasta 5 MB.
              </p>
            }
          >
            <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
            <CloudinaryUpload
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              resourceType="image"
              label="Subir imagen de portada"
              folder="lms/thumbnails"
              compact
            />
          </Campo>
        </div>
      </Seccion>

      <Seccion
        icon={Tag}
        title="Clasificación"
        description="Con estos datos los estudiantes filtran el catálogo."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="category" label="Categoría">
              <Input
                id="category"
                name="category"
                defaultValue={course?.category ?? ""}
                placeholder="Ej. ISO 9001"
                maxLength={80}
                className={CONTROL_ADMIN}
              />
            </Campo>

            <Campo
              id="durationHours"
              label={
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Duración estimada
                </span>
              }
            >
              <div className="relative">
                <Input
                  id="durationHours"
                  name="durationHours"
                  type="number"
                  min="0"
                  max="2000"
                  step="1"
                  defaultValue={course?.durationHours ?? ""}
                  placeholder="0"
                  className={cn(CONTROL_ADMIN, "pr-14")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  horas
                </span>
              </div>
            </Campo>
          </div>

          <Campo label="Nivel">
            <input type="hidden" name="level" value={level} />
            <Chips
              legend="Nivel del curso"
              name="level-ui"
              value={level}
              onChange={setLevel}
              options={[
                { value: "" as CourseLevelValue | "", label: "Sin especificar" },
                ...COURSE_LEVELS.map((l) => ({
                  value: l as CourseLevelValue | "",
                  label: COURSE_LEVEL_LABELS[l],
                })),
              ]}
            />
          </Campo>

          {instructors.length > 0 && (
            <InstructorSelect
              instructors={instructors}
              defaultValue={
                (
                  course as
                    | (SerializedCourse & { instructorId?: string | null })
                    | undefined
                )?.instructorId
              }
            />
          )}
        </div>
      </Seccion>

      <Seccion
        icon={DollarSign}
        title="Acceso y precio"
        description="Define cómo paga el estudiante: por el curso o por el certificado."
      >
        <input type="hidden" name="isFree" value={isFree ? "true" : "false"} />

        <div className="grid gap-3 sm:grid-cols-2">
          <OpcionCard
            name="acceso-ui"
            icon={DollarSign}
            label="De pago"
            description="El estudiante paga para inscribirse. El certificado va incluido."
            activo={!isFree}
            onSelect={() => setIsFree(false)}
          />
          <OpcionCard
            name="acceso-ui"
            icon={Gift}
            label="Gratuito"
            description="La inscripción es libre y solo se cobra el certificado al aprobar."
            activo={isFree}
            onSelect={() => setIsFree(true)}
          />
        </div>

        <div className="mt-5">
          {isFree ? (
            <>
              <input type="hidden" name="price" value="0" />
              <Campo
                id="certificateFee"
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="size-3.5" />
                    Costo del certificado
                  </span>
                }
                className="max-w-60"
                hint={
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Obligatorio en cursos gratuitos. Es lo que paga el estudiante
                    al aprobar la evaluación.
                  </p>
                }
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    S/
                  </span>
                  <Input
                    id="certificateFee"
                    name="certificateFee"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    defaultValue={
                      course?.certificateFee != null
                        ? Number(course.certificateFee)
                        : ""
                    }
                    placeholder="0.00"
                    className={cn(CONTROL_ADMIN, "pl-9 font-semibold")}
                  />
                </div>
              </Campo>
            </>
          ) : (
            <Campo
              id="price"
              label="Precio del curso"
              className="max-w-60"
              hint={
                <p className="text-[11px] text-muted-foreground">
                  Incluye la emisión del certificado.
                </p>
              }
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  S/
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={
                    course && !course.isFree ? Number(course.price) : ""
                  }
                  placeholder="0.00"
                  className={cn(CONTROL_ADMIN, "pl-9 font-semibold")}
                />
              </div>
            </Campo>
          )}
        </div>
      </Seccion>

      <Seccion
        icon={BadgeCheck}
        title="Certificado"
        description="Vigencia y texto del certificado que se emite al aprobar."
      >
        <input
          type="hidden"
          name="certificateValidityDays"
          value={dias ? String(dias) : ""}
        />

        <div className="space-y-5">
          <Campo label="Vigencia">
            <Chips
              legend="Vigencia del certificado"
              name="vigencia-ui"
              value={vigencia}
              onChange={setVigencia}
              options={[
                { value: "none" as Vigencia, label: "Sin vencimiento" },
                ...VALIDITY_OPTIONS.map((o) => ({
                  value: o.value as Vigencia,
                  label: o.label,
                })),
                { value: "custom" as Vigencia, label: "Personalizado" },
              ]}
            />
          </Campo>

          {vigencia === "custom" && (
            <Campo
              id="customDays"
              label="Días de validez"
              className="max-w-45"
              hint={
                <p className="text-[11px] text-muted-foreground">
                  Entre 1 y 3650 días.
                </p>
              }
            >
              <div className="relative">
                <Input
                  id="customDays"
                  type="number"
                  min="1"
                  max="3650"
                  step="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="545"
                  className={cn(CONTROL_ADMIN, "pr-12")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  días
                </span>
              </div>
            </Campo>
          )}

          <p className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            {vence ? (
              <>
                <CalendarDays className="size-3.5 shrink-0 text-primary" />
                Un certificado emitido hoy vencería el{" "}
                <span className="font-semibold text-foreground">
                  {formatDate(vence)}
                </span>
              </>
            ) : (
              <>
                <InfinityIcon className="size-3.5 shrink-0 text-primary" />
                {vigencia === "custom"
                  ? "Indica los días de validez para calcular el vencimiento."
                  : "Los certificados de este curso no caducarán."}
              </>
            )}
          </p>

          <Campo
            id="certificateDescription"
            label={
              <>
                Texto del certificado{" "}
                <span className="font-normal text-muted-foreground/60">
                  (opcional)
                </span>
              </>
            }
            hint={
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Aparece bajo el título en el PDF. Si lo dejas vacío se usa el
                  texto por defecto del sistema.
                </p>
                <Contador valor={certDescription.length} max={MAX_CERT_DESC} />
              </div>
            }
          >
            <Textarea
              id="certificateDescription"
              name="certificateDescription"
              rows={3}
              maxLength={MAX_CERT_DESC}
              value={certDescription}
              onChange={(e) => setCertDescription(e.target.value)}
              placeholder="Ej. Por haber completado satisfactoriamente el programa de capacitación profesional."
              className={cn(AREA_ADMIN, "min-h-24")}
            />
          </Campo>
        </div>
      </Seccion>

      {!course && (
        <Seccion
          icon={EyeOff}
          title="Visibilidad"
          description="Los cursos nuevos se crean siempre como borrador."
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            Al guardar entrarás al editor del curso para crear los módulos y
            capítulos. El botón de publicar está en la cabecera del editor.
          </p>
        </Seccion>
      )}

      {/* La publicación se controla desde la cabecera; aquí solo se conserva
          el valor actual para que guardar no despublique el curso. */}
      {course && (
        <input
          type="hidden"
          name="published"
          value={course.published ? "true" : "false"}
        />
      )}

      {state?.error && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {course
            ? "Los cambios se aplican de inmediato en el catálogo."
            : "Podrás editar todos estos datos más adelante."}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="min-h-11 justify-center font-semibold sm:min-h-10"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={pending || title.trim().length < 3}
            className="min-h-11 justify-center gap-2 font-semibold sm:min-h-10"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="size-4" />
                {course ? "Guardar cambios" : "Crear curso"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
