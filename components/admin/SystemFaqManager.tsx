"use client";

import { useActionState, useEffect, useState } from "react";
import { HelpCircle, Loader2, Pencil, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { createSystemFaq, deleteSystemFaq, updateSystemFaq } from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

type SystemFaq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  published: boolean;
};

type ActionState = { error?: string; success?: boolean } | null;

function SystemFaqDialog({
  mode,
  faq,
  trigger,
}: {
  mode: "create" | "edit";
  faq?: SystemFaq;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "");
  const [published, setPublished] = useState(faq?.published ?? true);

  const action = mode === "create" ? createSystemFaq : updateSystemFaq;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(mode === "create" ? "Pregunta creada" : "Pregunta actualizada");
      setOpen(false);
      if (mode === "create") {
        setQuestion("");
        setAnswer("");
        setCategory("");
        setPublished(true);
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
          <DialogTitle>{mode === "create" ? "Nueva pregunta global" : "Editar pregunta"}</DialogTitle>
          <DialogDescription>
            Estas preguntas se muestran en la página de ayuda del estudiante.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {mode === "edit" && faq && <input type="hidden" name="id" value={faq.id} />}
          <input type="hidden" name="published" value={published ? "true" : "false"} />

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
              placeholder="¿Cómo descargo mi certificado?"
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
              placeholder="Una vez completado el curso, encontrarás el certificado en /student/certificates..."
            />
            <p className="text-[11px] text-muted-foreground">
              {answer.length}/2000 caracteres
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Categoría (opcional)</Label>
            <Input
              id="category"
              name="category"
              maxLength={50}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="cursos, certificados, pagos, cuenta..."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Publicada</p>
              <p className="text-xs text-muted-foreground">Si está apagada, no se mostrará a los estudiantes.</p>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
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
  faqs: SystemFaq[];
};

export function SystemFaqManager({ faqs }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Preguntas frecuentes globales</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Estas preguntas se muestran en /student/faq, accesible desde el panel del estudiante.
          </p>
        </div>
        <SystemFaqDialog
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
          title="Aún no hay preguntas globales"
          description="Agrega preguntas frecuentes para ayudar a los estudiantes a resolver dudas comunes."
          action={
            <SystemFaqDialog
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
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground text-sm">{faq.question}</p>
                  {faq.category && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                  )}
                  {!faq.published && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                      Oculta
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">
                  {faq.answer}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <SystemFaqDialog
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
                    await deleteSystemFaq(faq.id);
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
