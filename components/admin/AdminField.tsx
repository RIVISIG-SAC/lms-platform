import { AlertCircle, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  CHIP_ADMIN,
  CHIP_ADMIN_OFF,
  CHIP_ADMIN_ON,
} from "@/components/admin/form-styles";
import { cn } from "@/lib/utils";

/** Etiqueta + control + ayuda, con el mismo ritmo en todos los formularios. */
export function AdminField({
  id,
  label,
  hint,
  className,
  children,
}: {
  id?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint}
    </div>
  );
}

/** Texto de ayuda bajo un campo. */
export function AdminHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

/** Contador de caracteres que avisa al acercarse al límite. */
export function CharCount({ value, max }: { value: number; max: number }) {
  return (
    <span
      className={cn(
        "shrink-0 text-[11px] tabular-nums",
        value > max * 0.9
          ? "font-semibold text-amber-700"
          : "text-muted-foreground",
      )}
    >
      {value}/{max}
    </span>
  );
}

/** Ayuda a la izquierda y contador a la derecha. */
export function AdminHintRow({
  children,
  value,
  max,
}: {
  children: React.ReactNode;
  value: number;
  max: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <AdminHint>{children}</AdminHint>
      <CharCount value={value} max={max} />
    </div>
  );
}

/** Aviso de error devuelto por un server action. */
export function AdminAlert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

/** Icono en chip para las cabeceras de diálogo. */
export function DialogIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="mb-2 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="size-6" />
    </span>
  );
}

/** Grupo de opciones excluyentes en forma de chips. */
export function AdminChips<T extends string | number>({
  name,
  value,
  onChange,
  options,
  legend,
}: {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  legend: string;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">{legend}</legend>
      {options.map((opt) => {
        const activo = value === opt.value;
        return (
          <label
            key={String(opt.value)}
            className={cn(CHIP_ADMIN, activo ? CHIP_ADMIN_ON : CHIP_ADMIN_OFF)}
          >
            <input
              type="radio"
              name={name}
              checked={activo}
              onChange={() => onChange(opt.value)}
              className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
            />
            {opt.label}
          </label>
        );
      })}
    </fieldset>
  );
}
