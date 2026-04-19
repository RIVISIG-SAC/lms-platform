"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createResource } from "@/app/actions/courses";
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

type ActionState = { error?: string; success?: boolean } | null;

const RESOURCE_TYPES = [
  { value: "PDF", label: "PDF" },
  { value: "PPTX", label: "Presentación (PPTX)" },
  { value: "DOCX", label: "Documento (DOCX)" },
  { value: "XLSX", label: "Hoja de cálculo (XLSX)" },
  { value: "OTRO", label: "Otro" },
];

type Props = {
  chapterId: string;
  courseId: string;
  trigger?: ReactNode;
};

export function ResourceDialog({ chapterId, courseId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("PDF");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createResource, null);

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Recurso añadido");
      setOpen(false);
      setType("PDF");
    }
  }, [state]);

  const triggerNode = trigger ?? (
    <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-semibold">
      <Plus className="size-3.5" /> Añadir recurso
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerNode as React.ReactElement} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Añadir recurso descargable</DialogTitle>
          <DialogDescription>
            Los estudiantes podrán descargar este archivo desde el capítulo.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 py-1">
          <input type="hidden" name="chapterId" value={chapterId} />
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="type" value={type} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="resource-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="resource-name"
                name="name"
                required
                placeholder="Ej. Plantilla de matriz de riesgos"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resource-type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo
              </Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger id="resource-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resource-url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              URL del archivo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="resource-url"
              name="url"
              type="url"
              required
              placeholder="https://..."
            />
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
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Añadiendo...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Añadir recurso
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
