"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, BookOpen, IdCard, Loader2, Save, User as UserIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CourseOption = {
  id: string;
  title: string;
  certificateDescription: string | null;
  certificateValidityDays: number | null;
};

type ActionState = { error?: string; success?: boolean } | null;
type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

type Props = {
  courses: CourseOption[];
  action: Action;
};

const fieldLabelClassName =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const sectionCardClassName =
  "space-y-5 rounded-xl border border-border/70 bg-card p-5 md:p-6";
const controlClassName =
  "h-12 rounded-xl border-border/80 bg-background text-[15px]";

export function ManualCertificateForm({ courses, action }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const [courseId, setCourseId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === courseId) ?? null,
    [courses, courseId],
  );

  useEffect(() => {
    if (!descriptionTouched) {
      setDescription(selectedCourse?.certificateDescription ?? "");
    }
  }, [selectedCourse, descriptionTouched]);

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success("Certificado manual creado");
      router.push("/admin/certificates");
    }
  }, [state, router]);

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        No hay cursos publicados. Publica al menos un curso antes de emitir certificados
        manuales.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* ── Sección 1: Datos del titular ──────────────────────── */}
      <section className={sectionCardClassName}>
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <UserIcon className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Datos del titular</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              La empresa aparece arriba del nombre en el certificado. El DNI debajo.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holderCompany" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
              <Building2 className="size-3.5" /> Empresa
            </Label>
            <Input
              id="holderCompany"
              name="holderCompany"
              maxLength={100}
              placeholder="Ej. ACME S.A."
              className={controlClassName}
            />
            <p className="text-xs text-muted-foreground">Opcional. Aparece encima del nombre.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderName" className={fieldLabelClassName}>
              Nombre completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="holderName"
              name="holderName"
              required
              minLength={3}
              maxLength={120}
              placeholder="Ej. Juan Pérez García"
              className={controlClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderDni" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
              <IdCard className="size-3.5" /> DNI
            </Label>
            <Input
              id="holderDni"
              name="holderDni"
              inputMode="numeric"
              pattern="\d{6,12}"
              maxLength={12}
              placeholder="Ej. 12345678"
              className={controlClassName}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Entre 6 y 12 dígitos.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sección 2: Curso y descripción ────────────────────── */}
      <section className={sectionCardClassName}>
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Curso y descripción</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              La descripción se autocompleta con la del curso. Puedes editarla solo para este certificado.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseId" className={fieldLabelClassName}>
              Curso <span className="text-destructive">*</span>
            </Label>
            <input type="hidden" name="courseId" value={courseId} />
            <Select value={courseId} onValueChange={(v) => setCourseId(v ?? "")}>
              <SelectTrigger id="courseId" className={`${controlClassName} w-full`}>
                <SelectValue placeholder="Selecciona un curso">
                  {(value) => {
                    if (!value) return "Selecciona un curso";
                    const c = courses.find((x) => x.id === value);
                    return c?.title ?? String(value);
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCourse?.certificateValidityDays != null && (
              <p className="text-xs text-muted-foreground">
                Vigencia del certificado: {selectedCourse.certificateValidityDays} días desde la emisión.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customDescription" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
              <FileText className="size-3.5" /> Descripción del certificado
            </Label>
            <Textarea
              id="customDescription"
              name="customDescription"
              rows={4}
              maxLength={400}
              value={description}
              onChange={(e) => {
                setDescriptionTouched(true);
                setDescription(e.target.value);
              }}
              placeholder={
                selectedCourse
                  ? "Texto que aparecerá bajo el título del curso en el PDF"
                  : "Selecciona un curso para autocompletar"
              }
              className="resize-none rounded-xl border-border/80 bg-background text-[15px]"
            />
            <p className="text-xs text-muted-foreground">
              Si lo dejas vacío se usará el texto por defecto del sistema. Máximo 400 caracteres.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
        <Button
          type="submit"
          disabled={pending || !courseId}
          className="h-12 rounded-xl px-7 text-[15px] font-semibold"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Emitiendo...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Emitir certificado
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
