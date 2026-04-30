"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/app/actions/users";
import { KeyRound } from "lucide-react";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(changePasswordAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Contraseña actualizada correctamente");
      formRef.current?.reset();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <KeyRound className="size-3.5" /> Contraseña actual
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="Tu contraseña actual"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nueva contraseña
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Confirmar contraseña
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repite la nueva contraseña"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>
      <div className="pt-1">
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Guardando..." : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}
