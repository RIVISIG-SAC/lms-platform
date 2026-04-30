"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { toggleUserActiveAction } from "@/app/actions/users";

type Props = {
  userId: string;
  isActive: boolean;
};

export function UserActiveToggle({ userId, isActive }: Props) {
  const [pending, startTransition] = useTransition();

  function handleChange() {
    startTransition(async () => {
      const result = await toggleUserActiveAction(userId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isActive ? "Cuenta desactivada" : "Cuenta activada");
      }
    });
  }

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleChange}
      disabled={pending}
      aria-label={isActive ? "Desactivar cuenta" : "Activar cuenta"}
    />
  );
}
