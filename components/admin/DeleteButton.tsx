"use client";

import { useTransition } from "react";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: () => Promise<any>;
  label?: string;
  confirmMessage?: string;
};

export function DeleteButton({
  action,
  label = "Eliminar",
  confirmMessage = "¿Estás seguro? Esta acción no se puede deshacer.",
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(async () => { await action(); });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-[var(--destructive)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Eliminando..." : label}
    </button>
  );
}
