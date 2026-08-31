"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BaseProps = React.ComponentProps<"input"> & {
  label: React.ReactNode;
  icon: LucideIcon;
  /** Contenido alineado a la derecha de la etiqueta (p. ej. "¿Olvidaste tu contraseña?"). */
  accion?: React.ReactNode;
  /** Ayuda o validación bajo el campo. */
  hint?: React.ReactNode;
};

const CONTROL =
  "h-11 rounded-xl border-border bg-background pl-10 text-sm placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/25";

function Marco({
  id,
  label,
  icon: Icon,
  accion,
  hint,
  children,
}: {
  id: string;
  label: React.ReactNode;
  icon: LucideIcon;
  accion?: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label
          htmlFor={id}
          className="text-xs font-semibold text-muted-foreground"
        >
          {label}
        </Label>
        {accion}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        {children}
      </div>
      {hint}
    </div>
  );
}

/** Campo de texto con icono, etiqueta y ayuda opcional. */
export function AuthField({
  label,
  icon,
  accion,
  hint,
  className,
  id,
  ...props
}: BaseProps) {
  const auto = useId();
  const fieldId = id ?? auto;

  return (
    <Marco id={fieldId} label={label} icon={icon} accion={accion} hint={hint}>
      <Input id={fieldId} className={cn(CONTROL, className)} {...props} />
    </Marco>
  );
}

/** Campo de contraseña con botón para mostrar u ocultar el valor. */
export function PasswordField({
  label,
  icon,
  accion,
  hint,
  className,
  id,
  ...props
}: BaseProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  const [visible, setVisible] = useState(false);

  return (
    <Marco id={fieldId} label={label} icon={icon} accion={accion} hint={hint}>
      <Input
        id={fieldId}
        type={visible ? "text" : "password"}
        className={cn(CONTROL, "pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </Marco>
  );
}
