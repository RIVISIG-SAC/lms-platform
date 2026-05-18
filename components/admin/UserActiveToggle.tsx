"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { toggleUserActiveAction } from "@/app/actions/users";

type Props = {
  userId: string;
  isActive: boolean;
  isLastActiveAdmin?: boolean;
};

const LAST_ADMIN_MESSAGE =
  "Debe quedar al menos un administrador activo. No puedes desactivar al último.";

export function UserActiveToggle({
  userId,
  isActive,
  isLastActiveAdmin = false,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleChange() {
    if (isLastActiveAdmin) {
      toast.error(LAST_ADMIN_MESSAGE);
      return;
    }
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
    <span
      title={isLastActiveAdmin ? LAST_ADMIN_MESSAGE : undefined}
      className="inline-flex"
    >
      <Switch
        checked={isActive}
        onCheckedChange={handleChange}
        disabled={pending || isLastActiveAdmin}
        aria-label={
          isLastActiveAdmin
            ? LAST_ADMIN_MESSAGE
            : isActive
              ? "Desactivar cuenta"
              : "Activar cuenta"
        }
      />
    </span>
  );
}
