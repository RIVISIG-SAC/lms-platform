"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ActionResult = { error?: string; success?: boolean } | void | undefined;

type Props = {
  action: () => Promise<ActionResult>;
  title?: string;
  description?: string;
  triggerLabel?: string;
  confirmLabel?: string;
  successMessage?: string;
  variant?: "button" | "icon" | "link";
  triggerClassName?: string;
};

export function DeleteConfirmDialog({
  action,
  title = "¿Eliminar este elemento?",
  description = "Esta acción no se puede deshacer.",
  triggerLabel = "Eliminar",
  confirmLabel = "Eliminar",
  successMessage = "Eliminado correctamente",
  variant = "button",
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        const result = await action();
        if (result && typeof result === "object" && "error" in result && result.error) {
          toast.error(result.error);
          return;
        }
        toast.success(successMessage);
        setOpen(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        if (!message.toLowerCase().includes("next_redirect")) {
          toast.error(message);
        } else {
          setOpen(false);
        }
      }
    });
  }

  const trigger =
    variant === "icon" ? (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={triggerClassName ?? "text-destructive hover:bg-destructive/10"}
        aria-label={triggerLabel}
      >
        <Trash2 className="size-4" />
      </Button>
    ) : variant === "link" ? (
      <button
        type="button"
        className={
          triggerClassName ??
          "text-xs font-medium text-destructive hover:underline disabled:opacity-50"
        }
      >
        {triggerLabel}
      </button>
    ) : (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={
          triggerClassName ??
          "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        }
      >
        <Trash2 className="size-4" />
        {triggerLabel}
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <TriangleAlert className="size-5 text-destructive" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
