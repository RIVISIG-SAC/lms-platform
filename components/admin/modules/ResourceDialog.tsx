"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { Loader2, Paperclip, Plus } from "lucide-react";
import { toast } from "sonner";
import { createResource } from "@/app/actions/courses";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AdminAlert,
  AdminChips,
  AdminField,
  AdminHint,
  DialogIcon,
} from "@/components/admin/AdminField";
import { CONTROL_ADMIN } from "@/components/admin/form-styles";

type ActionState = { error?: string; success?: boolean } | null;

const RESOURCE_TYPES = [
  { value: "PDF", label: "PDF" },
  { value: "PPTX", label: "Presentación" },
  { value: "DOCX", label: "Documento" },
  { value: "XLSX", label: "Hoja de cálculo" },
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
  const [resourceUrl, setResourceUrl] = useState("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createResource,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Recurso añadido");
      setOpen(false);
      setType("PDF");
      setResourceUrl("");
    }
  }, [state]);

  const triggerNode = trigger ?? (
    <Button type="button" variant="outline" size="sm" className="font-semibold">
      <Plus className="size-3.5" /> Añadir recurso
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerNode as React.ReactElement} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogIcon icon={Paperclip} />
          <DialogTitle className="text-lg">Añadir recurso descargable</DialogTitle>
          <DialogDescription className="leading-relaxed">
            El archivo aparecerá en la barra lateral de la clase, disponible
            para todos los estudiantes inscritos.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="chapterId" value={chapterId} />
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="type" value={type} />

          <AdminField
            id="resource-name"
            label="Nombre visible"
            hint={
              <AdminHint>
                Es el texto que verá el estudiante, no el nombre del archivo.
              </AdminHint>
            }
          >
            <Input
              id="resource-name"
              name="name"
              required
              maxLength={120}
              placeholder="Ej. Plantilla de matriz de riesgos"
              autoFocus
              className={CONTROL_ADMIN}
            />
          </AdminField>

          <AdminField label="Tipo de archivo">
            <AdminChips
              legend="Tipo de recurso"
              name="resource-type-ui"
              value={type}
              onChange={setType}
              options={RESOURCE_TYPES}
            />
          </AdminField>

          <AdminField
            label="Archivo"
            hint={
              <AdminHint>
                PDF, PPTX, DOCX o XLSX hasta 50 MB.
              </AdminHint>
            }
          >
            <input type="hidden" name="url" value={resourceUrl} />
            <CloudinaryUpload
              value={resourceUrl}
              onChange={setResourceUrl}
              resourceType="raw"
              label="Subir archivo"
              folder="lms/resources"
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
              disabled={pending || !resourceUrl}
              className="w-full gap-2 font-semibold sm:w-auto"
            >
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
