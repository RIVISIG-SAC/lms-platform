"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfileAction } from "@/app/actions/users";

type Props = {
  name: string;
  email: string;
  dni?: string | null;
  company?: string | null;
};

export function ProfileForm({ name, email, dni, company }: Props) {
  const [state, action, pending] = useActionState(updateUserProfileAction, null);

  useEffect(() => {
    if (state?.success) toast.success("Perfil actualizado correctamente");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" name="name" defaultValue={name} required />
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
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
