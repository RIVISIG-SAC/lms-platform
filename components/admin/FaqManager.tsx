"use client";

import { useActionState, useEffect, useState } from "react";
import { HelpCircle, Loader2, Pencil, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { createCourseFaq, deleteCourseFaq, updateCourseFaq } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { EmptyState } from "@/components/admin/EmptyState";

type Faq = { id: string; question: string; answer: string; order: number };
type ActionState = { error?: string; success?: boolean } | null;

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
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(mode === "create" ? "Pregunta creada" : "Pregunta actualizada");
      setOpen(false);
      if (mode === "create") {
        setQuestion("");
        setAnswer("");
      }
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, mode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva pregunta frecuente" : "Editar pregunta"}</DialogTitle>
          <DialogDescription>
            Las preguntas frecuentes ayudan a resolver dudas comunes antes de la inscripción.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="courseId" value={courseId} />
          {mode === "edit" && faq && <input type="hidden" name="id" value={faq.id} />}

          <div className="space-y-1.5">
            <Label htmlFor="question">Pregunta</Label>
            <Input
              id="question"
              name="question"
              required
              minLength={3}
              maxLength={200}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="¿El certificado tiene validez internacional?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="answer">Respuesta</Label>
            <Textarea
              id="answer"
              name="answer"
              required
              minLength={3}
              maxLength={2000}
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Sí, el certificado cuenta con un código verificable y está alineado a estándares ISO."
            />
            <p className="text-[11px] text-muted-foreground">
              {answer.length}/2000 caracteres
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {mode === "create" ? "Crear pregunta" : "Guardar cambios"}
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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Preguntas frecuentes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Las preguntas y respuestas se muestran en la página pública del curso.
          </p>
        </div>
        <FaqDialog
          courseId={courseId}
          mode="create"
          trigger={
            <Button className="gap-2">
              <Plus className="size-4" /> Nueva pregunta
            </Button>
          }
        />
      </div>

      {faqs.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="Aún no hay preguntas frecuentes"
          description="Agrega preguntas y respuestas que ayuden a los estudiantes a decidirse antes de inscribirse."
          action={
            <FaqDialog
              courseId={courseId}
              mode="create"
              trigger={
                <Button variant="ghost" className="gap-2">
                  <Plus className="size-4" /> Crear primera pregunta
                </Button>
              }
            />
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <li
              key={faq.id}
              className="border border-border rounded-xl bg-card p-4 flex items-start gap-3"
            >
              <span className="inline-flex shrink-0 size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{faq.question}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">
                  {faq.answer}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <FaqDialog
                  courseId={courseId}
                  mode="edit"
                  faq={faq}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Editar pregunta">
                      <Pencil className="size-4" />
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
