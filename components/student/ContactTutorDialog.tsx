"use client";

import { useActionState, useEffect, useState, type ReactElement } from "react";
import { BookOpen, Loader2, Send, Mail } from "lucide-react";
import { toast } from "sonner";
import { sendSupportMessage } from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SUPPORT_MESSAGE_MAX,
  SUPPORT_MESSAGE_MIN,
  SUPPORT_SUBJECT_MAX,
  SUPPORT_SUBJECT_MIN,
} from "@/lib/validations/support";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ActionState = { error?: string; success?: boolean } | null;

type Props = {
  userEmail: string;
  userName: string;
  trigger: ReactElement;
  /** Curso desde el que se abre el diálogo, si aplica. */
  courseId?: string;
  courseTitle?: string;
};

export function ContactTutorDialog({
  userEmail,
  userName,
  trigger,
  courseId,
  courseTitle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    sendSupportMessage,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Mensaje enviado. Te responderemos a tu correo.");
      setOpen(false);
      setSubject("");
      setMessage("");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contactar tutor</DialogTitle>
          <DialogDescription>
            Cuéntanos en qué podemos ayudarte. Te responderemos por correo en horario hábil.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
          <Mail className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">
            Enviando como <strong className="font-semibold text-foreground">{userName}</strong>
          </span>
          <span className="text-muted-foreground/60">·</span>
          <span className="text-primary font-medium truncate">{userEmail}</span>
        </div>

        {courseId && courseTitle && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
            <BookOpen className="size-3.5 shrink-0 text-primary" />
            <span className="text-muted-foreground">
              Sobre{" "}
              <strong className="font-semibold text-foreground">
                {courseTitle}
              </strong>
            </span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {courseId && <input type="hidden" name="courseId" value={courseId} />}

          <div className="space-y-1.5">
            <Label htmlFor="contact-subject">Asunto</Label>
            <Input
              id="contact-subject"
              name="subject"
              required
              minLength={SUPPORT_SUBJECT_MIN}
              maxLength={SUPPORT_SUBJECT_MAX}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej. No puedo descargar mi certificado"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Mensaje</Label>
            <Textarea
              id="contact-message"
              name="message"
              required
              minLength={SUPPORT_MESSAGE_MIN}
              maxLength={SUPPORT_MESSAGE_MAX}
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                courseTitle
                  ? "Describe tu duda: en qué clase estás y qué intentaste hacer..."
                  : "Describe tu duda o problema con el mayor detalle posible (curso, capítulo, qué intentaste hacer)..."
              }
            />
            <p className="text-[11px] text-muted-foreground">
              {message.length}/{SUPPORT_MESSAGE_MAX} caracteres
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Enviar mensaje
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
