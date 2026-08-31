"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  GraduationCap,
  Loader2,
  Mail,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { adminEnrollUserAction } from "@/app/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type EnrollCourseOption = {
  id: string;
  title: string;
};

type Props = {
  courses: EnrollCourseOption[];
  trigger?: ReactNode;
  prefilledStudent?: { id: string; email: string; name: string } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Días de acceso que concede `adminEnrollUserAction`. */
const DIAS_ACCESO = 180;

const CONTROL =
  "h-11 rounded-xl border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-primary/25";

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function EnrollStudentDialog({
  courses,
  trigger,
  prefilledStudent,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [courseId, setCourseId] = useState<string>("");
  const [state, formAction, pending] = useActionState(adminEnrollUserAction, null);

  useEffect(() => {
    if (!state) return;
    if ("error" in state) {
      toast.error(state.error);
      return;
    }
    if (state.success) {
      toast.success(
        state.created
          ? "Estudiante inscrito y cuenta creada. Se enviaron credenciales por correo."
          : "Estudiante inscrito correctamente.",
      );
      setOpen(false);
      setCourseId("");
    }
  }, [state]);

  useEffect(() => {
    if (!open) {
      setCourseId("");
    }
  }, [open]);

  const isPrefilled = Boolean(prefilledStudent);
  const sinCursos = courses.length === 0;
  const cursoElegido = courses.find((c) => c.id === courseId);
  const error = state && "error" in state ? state.error : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger render={trigger as React.ReactElement} /> : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <span className="mb-2 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="size-6" />
          </span>
          <DialogTitle className="text-lg">
            {isPrefilled ? "Inscribir a un curso" : "Inscribir estudiante"}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            {isPrefilled
              ? "Elige el curso al que quieres dar acceso."
              : "Busca al estudiante por su correo. Si aún no tiene cuenta, se creará automáticamente."}
          </DialogDescription>
        </DialogHeader>

        {sinCursos ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
              <span className="mx-auto inline-flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <BookOpen className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">
                No hay cursos publicados
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Publica al menos un curso para poder inscribir estudiantes.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full font-semibold sm:w-auto"
              >
                Entendido
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="courseId" value={courseId} />

            {/* Identidad del estudiante ya conocido */}
            {isPrefilled && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                  {iniciales(prefilledStudent!.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {prefilledStudent!.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {prefilledStudent!.email}
                  </p>
                </div>
                <input
                  type="hidden"
                  name="email"
                  value={prefilledStudent!.email}
                />
                <input
                  type="hidden"
                  name="name"
                  value={prefilledStudent!.name}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="enroll-course"
                className="text-xs font-semibold text-muted-foreground"
              >
                Curso
              </Label>
              <Select value={courseId} onValueChange={(v) => setCourseId(v ?? "")}>
                <SelectTrigger id="enroll-course" className={cn(CONTROL, "w-full")}>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {courses.length}{" "}
                {courses.length === 1
                  ? "curso publicado disponible"
                  : "cursos publicados disponibles"}
                .
              </p>
            </div>

            {!isPrefilled && (
              <>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="enroll-email"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="enroll-email"
                      name="email"
                      type="email"
                      required
                      placeholder="estudiante@correo.com"
                      autoFocus
                      className={cn(CONTROL, "pl-10")}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="enroll-name"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Nombre completo{" "}
                    <span className="font-normal text-muted-foreground/60">
                      (solo si la cuenta es nueva)
                    </span>
                  </Label>
                  <div className="relative">
                    <UserPlus className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="enroll-name"
                      name="name"
                      placeholder="Juan Pérez"
                      className={cn(CONTROL, "pl-10")}
                    />
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Si el correo ya está registrado se ignora este campo.
                  </p>
                </div>
              </>
            )}

            {/* Qué va a pasar al confirmar */}
            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3.5">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <CalendarClock className="mt-px size-3.5 shrink-0 text-primary" />
                El acceso {cursoElegido ? "a " : ""}
                {cursoElegido && (
                  <span className="font-semibold text-foreground">
                    {cursoElegido.title}
                  </span>
                )}{" "}
                quedará activo por {DIAS_ACCESO} días.
              </p>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Mail className="mt-px size-3.5 shrink-0 text-primary" />
                Se enviará un correo de confirmación
                {!isPrefilled && ", con credenciales temporales si la cuenta es nueva"}
                .
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="w-full font-semibold sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={pending || !courseId}
                className="w-full gap-2 font-semibold sm:w-auto"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <GraduationCap className="size-4" />
                    Inscribir
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
