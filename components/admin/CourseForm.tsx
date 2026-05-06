"use client";

import { useActionState, useEffect, useState } from "react";
import type { SerializedCourse } from "@/lib/serialize";
import {
  Type,
  DollarSign,
  ImageIcon,
  Save,
  Loader2,
  Tag,
  Signal,
  Clock,
  Globe2,
  Eye,
  EyeOff,
  Gift,
  Award,
  CalendarDays,
} from "lucide-react";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COURSE_LEVELS,
  COURSE_LEVEL_LABELS,
  VALIDITY_OPTIONS,
  type CourseLevelValue,
} from "@/lib/validations/course";
import { InstructorSelect, type InstructorOption } from "@/components/admin/InstructorSelect";

type ActionState = { error?: string; success?: boolean } | null;
type CourseAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

type Props = {
  action: CourseAction;
  course?: SerializedCourse;
  instructors?: InstructorOption[];
};

function SectionHeader({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Type;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

export function CourseForm({ action, course, instructors = [] }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const [published, setPublished] = useState<boolean>(course?.published ?? false);
  const [isFree, setIsFree] = useState<boolean>(course?.isFree ?? false);
  const [level, setLevel] = useState<CourseLevelValue | "">(
    (course?.level as CourseLevelValue | null) ?? ""
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(course?.thumbnailUrl ?? "");
  const [hasCertExpiry, setHasCertExpiry] = useState<boolean>(
    course?.certificateValidityDays != null
  );
  const [validityDays, setValidityDays] = useState<number | "custom">(() => {
    const v = course?.certificateValidityDays;
    if (v == null) return 365;
    return VALIDITY_OPTIONS.some((o) => o.value === v) ? v : "custom";
  });
  const [customDays, setCustomDays] = useState<string>(() => {
    const v = course?.certificateValidityDays;
    if (v == null || VALIDITY_OPTIONS.some((o) => o.value === v)) return "";
    return String(v);
  });

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success("Cambios guardados correctamente");
  }, [state]);

  return (
    <form action={formAction} className="space-y-8">
      {course && <input type="hidden" name="id" value={course.id} />}

      {/* ── Sección 1: Identidad ────────────────────────────────── */}
      <section className="space-y-5">
        <SectionHeader
          icon={Type}
          title="Identidad del curso"
          hint="Datos básicos visibles para estudiantes."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              minLength={3}
              defaultValue={course?.title}
              placeholder="Ej. Implementación de ISO 9001:2015"
              className="h-11"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={course?.description}
              placeholder="Resume el objetivo, el alcance y el público objetivo del curso."
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Se mostrará en el catálogo público. Mínimo 10 caracteres.
            </p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="size-3.5" /> Imagen de portada
            </Label>
            <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
            <CloudinaryUpload
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              resourceType="image"
              label="Subir imagen de portada"
              folder="lms/thumbnails"
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Sección 2: Clasificación ──────────────────────────── */}
      <section className="space-y-5">
        <SectionHeader
          icon={Tag}
          title="Clasificación"
          hint="Ayuda a estudiantes y administradores a filtrar el catálogo."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categoría
            </Label>
            <Input
              id="category"
              name="category"
              defaultValue={course?.category ?? ""}
              placeholder="Ej. ISO 9001"
              maxLength={80}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Signal className="size-3.5" /> Nivel
            </Label>
            <input type="hidden" name="level" value={level} />
            <Select
              value={level}
              onValueChange={(v) => setLevel(v as CourseLevelValue | "")}
            >
              <SelectTrigger id="level" className="h-11 w-full">
                <SelectValue placeholder="Selecciona un nivel">
                  {(value) => {
                    if (!value) return "Selecciona un nivel";
                    return COURSE_LEVEL_LABELS[value as CourseLevelValue] ?? String(value);
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COURSE_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {COURSE_LEVEL_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationHours" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5" /> Duración
            </Label>
            <div className="relative">
              <Input
                id="durationHours"
                name="durationHours"
                type="number"
                min="0"
                step="1"
                defaultValue={course?.durationHours ?? ""}
                placeholder="0"
                className="h-11 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                hrs
              </span>
            </div>
          </div>

          {instructors.length > 0 && (
            <div className="md:col-span-3">
              <InstructorSelect
                instructors={instructors}
                defaultValue={(course as (SerializedCourse & { instructorId?: string | null }) | undefined)?.instructorId}
              />
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* ── Sección 3: Precio y publicación ───────────────────── */}
      <section className="space-y-5">
        <SectionHeader
          icon={DollarSign}
          title="Precio y visibilidad"
          hint="Controla el monto y cuándo el curso se muestra al público."
        />

        <input type="hidden" name="isFree" value={isFree ? "true" : "false"} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Toggle curso gratuito */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Gift className="size-3.5" /> Tipo de acceso
            </Label>
            <div className="h-11 flex items-center gap-3 rounded-lg border border-input bg-accent/30 px-3.5">
              <Switch id="isFree" checked={isFree} onCheckedChange={setIsFree} />
              <Label htmlFor="isFree" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                {isFree ? (
                  <>
                    <Gift className="size-3.5 text-primary" />
                    Curso gratuito (el certificado tiene costo)
                  </>
                ) : (
                  <>
                    <DollarSign className="size-3.5 text-muted-foreground" />
                    Curso de pago
                  </>
                )}
              </Label>
            </div>
          </div>

          {/* Precio del curso (solo si no es gratuito) */}
          {!isFree && (
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Inversión <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  S/
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required={!isFree}
                  defaultValue={course && !course.isFree ? Number(course.price) : ""}
                  placeholder="0.00"
                  className="pl-9 h-11 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Costo del certificado (solo si es gratuito) */}
          {isFree && (
            <>
              <input type="hidden" name="price" value="0" />
              <div className="space-y-2">
                <Label htmlFor="certificateFee" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Award className="size-3.5" /> Costo del certificado <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    S/
                  </span>
                  <Input
                    id="certificateFee"
                    name="certificateFee"
                    type="number"
                    min="1"
                    step="0.01"
                    required={isFree}
                    defaultValue={course?.certificateFee != null ? Number(course.certificateFee) : ""}
                    placeholder="0.00"
                    className="pl-9 h-11 font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Monto que pagará el estudiante para obtener su certificado al aprobar.
                </p>
              </div>
            </>
          )}

          {course && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Globe2 className="size-3.5" /> Estado
              </Label>
              <div className="h-11 flex items-center gap-3 rounded-lg border border-input bg-accent/30 px-3.5">
                <input type="hidden" name="published" value={published ? "true" : "false"} />
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label
                  htmlFor="published"
                  className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                >
                  {published ? (
                    <>
                      <Eye className="size-3.5 text-primary" />
                      Publicado
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-3.5 text-muted-foreground" />
                      Borrador
                    </>
                  )}
                </Label>
              </div>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* ── Sección 4: Vigencia del certificado ───────────────── */}
      <section className="space-y-5">
        <SectionHeader
          icon={CalendarDays}
          title="Vigencia del certificado"
          hint="Define si el certificado emitido al aprobar tiene fecha de vencimiento."
        />

        <input
          type="hidden"
          name="certificateValidityDays"
          value={
            hasCertExpiry
              ? validityDays === "custom"
                ? customDays
                : String(validityDays)
              : ""
          }
        />

        <div className="space-y-4">
          <div className="h-11 flex items-center gap-3 rounded-lg border border-input bg-accent/30 px-3.5">
            <Switch
              id="hasCertExpiry"
              checked={hasCertExpiry}
              onCheckedChange={setHasCertExpiry}
            />
            <Label htmlFor="hasCertExpiry" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              {hasCertExpiry ? (
                <>
                  <CalendarDays className="size-3.5 text-primary" />
                  El certificado tiene fecha de vencimiento
                </>
              ) : (
                <>
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  Sin fecha de vencimiento
                </>
              )}
            </Label>
          </div>

          {hasCertExpiry && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validitySelect" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duración de la vigencia
                </Label>
                <Select
                  value={String(validityDays)}
                  onValueChange={(v) =>
                    setValidityDays(v === "custom" ? "custom" : Number(v))
                  }
                >
                  <SelectTrigger id="validitySelect" className="h-11 w-full">
                    <SelectValue placeholder="Selecciona una opción">
                      {(value) => {
                        if (!value) return "Selecciona una opción";
                        if (value === "custom") return "Días personalizados";
                        const option = VALIDITY_OPTIONS.find((o) => String(o.value) === String(value));
                        return option?.label ?? String(value);
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {VALIDITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Días personalizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {validityDays === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customDays" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Días de validez
                  </Label>
                  <div className="relative">
                    <Input
                      id="customDays"
                      type="number"
                      min="1"
                      max="3650"
                      step="1"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Ej. 545"
                      className="h-11 pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      días
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Entre 1 y 3650 días.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
        <Button type="submit" disabled={pending} className="h-10 px-6 font-semibold">
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
    </form>
  );
}
