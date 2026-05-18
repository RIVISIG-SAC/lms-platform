"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger render={trigger as React.ReactElement} /> : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isPrefilled ? `Inscribir a ${prefilledStudent!.name}` : "Inscribir estudiante"}
          </DialogTitle>
          <DialogDescription>
            {isPrefilled
              ? "Selecciona el curso al que deseas inscribir a este estudiante. El acceso quedará activo por 180 días."
              : "Si el correo no existe, se creará una cuenta de estudiante y se enviarán las credenciales por correo."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 py-1">
          <input type="hidden" name="courseId" value={courseId} />

          <div className="space-y-1.5">
            <Label htmlFor="enroll-course" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Curso <span className="text-destructive">*</span>
            </Label>
            <Select value={courseId} onValueChange={(v) => setCourseId(v ?? "")}>
              <SelectTrigger id="enroll-course" className="w-full">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No hay cursos publicados.
                  </div>
                ) : (
                  courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enroll-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Correo electrónico <span className="text-destructive">*</span>
            </Label>
            <Input
              id="enroll-email"
              name="email"
              type="email"
              required
              defaultValue={prefilledStudent?.email ?? ""}
              readOnly={isPrefilled}
              placeholder="estudiante@correo.com"
              autoFocus={!isPrefilled}
            />
          </div>

          {!isPrefilled && (
            <div className="space-y-1.5">
              <Label htmlFor="enroll-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nombre completo
              </Label>
              <Input
                id="enroll-name"
                name="name"
                placeholder="Solo necesario si la cuenta no existe"
              />
              <p className="text-xs text-muted-foreground">
                Si el correo ya está registrado, se ignora. Si es nuevo, será obligatorio.
              </p>
            </div>
          )}
          {isPrefilled && (
            <input type="hidden" name="name" value={prefilledStudent!.name} />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !courseId}>
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
      </DialogContent>
    </Dialog>
  );
}
