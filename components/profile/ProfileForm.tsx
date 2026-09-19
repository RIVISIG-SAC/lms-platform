"use client";

import { useActionState, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfileAction } from "@/app/actions/users";
import { NOMBRE_MAX } from "@/lib/validations/person-name";
import { toCertificateHolderName } from "@/lib/utils";

type Props = {
  name: string;
  email: string;
  dni?: string | null;
  company?: string | null;
  /** Certificados ya emitidos a nombre de esta persona. */
  issuedCertificates?: number;
};

export function ProfileForm({
  name,
  email,
  dni,
  company,
  issuedCertificates = 0,
}: Props) {
  const [state, action, pending] = useActionState(updateUserProfileAction, null);
  const [nombre, setNombre] = useState(name);

  useEffect(() => {
    if (state?.success) toast.success("Perfil actualizado correctamente");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            name="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={NOMBRE_MAX}
            required
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            En tus certificados se imprime en mayúsculas:{" "}
            <span className="font-semibold text-foreground">
              {nombre.trim() ? toCertificateHolderName(nombre.trim()) : "—"}
            </span>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" defaultValue={email} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dni">DNI</Label>
          <Input
            id="dni"
            name="dni"
            type="text"
            inputMode="numeric"
            placeholder="12345678"
            defaultValue={dni ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">
            Empresa{" "}
            <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
          </Label>
          <Input
            id="company"
            name="company"
            type="text"
            placeholder="Tu empresa"
            defaultValue={company ?? ""}
          />
        </div>
      </div>
      {issuedCertificates > 0 && (
        <p className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Ya tienes{" "}
            <strong className="text-foreground">
              {issuedCertificates}{" "}
              {issuedCertificates === 1 ? "certificado emitido" : "certificados emitidos"}
            </strong>
            . Cambiar tu nombre aquí no modifica lo ya emitido: el certificado
            conserva el nombre con el que se otorgó. Si hay un error, escríbenos
            para corregirlo.
          </span>
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
