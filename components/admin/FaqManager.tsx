"use client";

import { useActionState, useEffect, useState } from "react";
import { HelpCircle, Loader2, Pencil, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import {
  createCourseFaq,
  deleteCourseFaq,
  updateCourseFaq,
} from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  AdminAlert,
  AdminField,
  AdminHintRow,
  DialogIcon,
} from "@/components/admin/AdminField";
import { AREA_ADMIN, CONTROL_ADMIN } from "@/components/admin/form-styles";
import { cn } from "@/lib/utils";

type Faq = { id: string; question: string; answer: string; order: number };
type ActionState = { error?: string; success?: boolean } | null;

const MAX_PREGUNTA = 200;
const MAX_RESPUESTA = 2000;

function FaqDialog({
  courseId,
  mode,
  faq,
  trigger,
}: {
  courseId: string;
  mode: "create" | "edit";
  faq?: Faq;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");

  const action = mode === "create" ? createCourseFaq : updateCourseFaq;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(
        mode === "create" ? "Pregunta creada" : "Pregunta actualizada",
      );
      setOpen(false);
      if (mode === "create") {
        setQuestion("");
        setAnswer("");
      }
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, mode]);

  const listo = question.trim().length >= 3 && answer.trim().length >= 3;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogIcon icon={mode === "create" ? Plus : Pencil} />
          <DialogTitle className="text-lg">
            {mode === "create" ? "Nueva pregunta frecuente" : "Editar pregunta"}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Se muestra en la página pública del curso, antes de que el
            estudiante decida inscribirse.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="courseId" value={courseId} />
          {mode === "edit" && faq && (
            <input type="hidden" name="id" value={faq.id} />
          )}

          <AdminField
            id="question"
            label="Pregunta"
            hint={
              <AdminHintRow value={question.length} max={MAX_PREGUNTA}>
                Redáctala como la haría un estudiante.
              </AdminHintRow>
            }
          >
            <Input
              id="question"
              name="question"
              required
              minLength={3}
              maxLength={MAX_PREGUNTA}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="¿El certificado tiene validez internacional?"
              autoFocus
              className={CONTROL_ADMIN}
            />
          </AdminField>

          <AdminField
            id="answer"
            label="Respuesta"
            hint={
              <AdminHintRow value={answer.length} max={MAX_RESPUESTA}>
                Los saltos de línea se respetan en la página pública.
              </AdminHintRow>
            }
          >
            <Textarea
              id="answer"
              name="answer"
              required
              minLength={3}
              maxLength={MAX_RESPUESTA}
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Sí, el certificado cuenta con un código verificable y está alineado a estándares ISO."
              className={cn(AREA_ADMIN, "min-h-32")}
            />
          </AdminField>

          {state?.error && <AdminAlert>{state.error}</AdminAlert>}

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
              disabled={pending || !listo}
              className="w-full gap-2 font-semibold sm:w-auto"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  {mode === "create" ? "Crear pregunta" : "Guardar cambios"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  courseId: string;
  faqs: Faq[];
};

export function FaqManager({ courseId, faqs }: Props) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Resuelven dudas comunes en la ficha pública del curso.
          </p>
        </div>
        <FaqDialog
          courseId={courseId}
          mode="create"
          trigger={
            <Button className="min-h-10 gap-2 font-semibold">
              <Plus className="size-4" /> Nueva pregunta
            </Button>
          }
        />
      </div>

      {faqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="size-6" />
          </span>
          <h3 className="mt-4 text-base font-bold text-foreground">
            Aún no hay preguntas frecuentes
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Añade las dudas que más repiten los interesados: modalidad, vigencia
            del certificado, requisitos previos.
          </p>
          <div className="mt-6 flex justify-center">
            <FaqDialog
              courseId={courseId}
              mode="create"
              trigger={
                <Button className="gap-2 font-bold">
                  <Plus className="size-4" /> Crear la primera pregunta
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {faqs.map((faq, idx) => (
            <li
              key={faq.id}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black tabular-nums text-primary">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-snug text-foreground">
                    {faq.question}
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <FaqDialog
                    courseId={courseId}
                    mode="edit"
                    faq={faq}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Editar pregunta"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    }
                  />
                  <DeleteConfirmDialog
                    action={async () => {
                      await deleteCourseFaq(faq.id, courseId);
                    }}
                    title="¿Eliminar pregunta?"
                    description={`Se eliminará "${faq.question}".`}
                    triggerLabel="Eliminar pregunta"
                    variant="icon"
                    successMessage="Pregunta eliminada"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
