"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Save, UserPen } from "lucide-react";
import { toast } from "sonner";
import { updateCertificateHolderAction } from "@/app/actions/certificates";
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
  AdminField,
  AdminHint,
  DialogIcon,
} from "@/components/admin/AdminField";
import { CONTROL_ADMIN } from "@/components/admin/form-styles";
import { NOMBRE_MAX } from "@/lib/validations/person-name";
import { toCertificateHolderName } from "@/lib/utils";

type ActionState = { error?: string; success?: boolean } | null;

type Props = {
  certificateId: string;
  holderName: string;
  holderDni: string | null;
  holderCompany: string | null;
  trigger: React.ReactElement;
};

/**
 * Corrección del titular de un certificado ya emitido.
 *
 * Existe porque el nombre queda congelado al emitir: si hay un error real
 * (tilde, cambio legal de nombre) esta es la vía para arreglarlo sin revocar
 * y reemitir el certificado.
 */
export function EditCertificateHolderDialog({
  certificateId,
  holderName,
  holderDni,
  holderCompany,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(holderName);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCertificateHolderAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Titular actualizado");
      setOpen(false);
    }
  }, [state]);

  useEffect(() => {
    if (open) setName(holderName);
  }, [open, holderName]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogIcon icon={UserPen} />
          <DialogTitle className="text-lg">Corregir titular</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Este es el nombre con el que se emitió el certificado. Cambiarlo
            reemite el PDF con los datos nuevos, así que úsalo solo para
            corregir errores reales.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="certificateId" value={certificateId} />

          <AdminField
            id="holderName"
            label="Nombre del titular"
            hint={
              <AdminHint>
                En el certificado se imprime en mayúsculas:{" "}
                <span className="font-semibold text-foreground">
                  {name.trim() ? toCertificateHolderName(name.trim()) : "—"}
                </span>
              </AdminHint>
            }
          >
            <Input
              id="holderName"
              name="holderName"
              required
              autoFocus
              maxLength={NOMBRE_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={CONTROL_ADMIN}
            />
          </AdminField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField id="holderDni" label="DNI">
              <Input
                id="holderDni"
                name="holderDni"
                inputMode="numeric"
                maxLength={12}
                defaultValue={holderDni ?? ""}
                placeholder="12345678"
                className={CONTROL_ADMIN}
              />
            </AdminField>

            <AdminField id="holderCompany" label="Empresa">
              <Input
                id="holderCompany"
                name="holderCompany"
                maxLength={100}
                defaultValue={holderCompany ?? ""}
                placeholder="Opcional"
                className={CONTROL_ADMIN}
              />
            </AdminField>
          </div>

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
              disabled={pending || name.trim().length < 2}
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
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
