import Link from "next/link";
import { ArrowRight, MoveDown, MoveRight, MoveUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Delta } from "@/lib/admin-dashboard";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Aclara qué mide la cifra; siempre visible, no solo al pasar el ratón. */
  hint?: string;
  delta?: Delta;
  href?: string;
  linkLabel?: string;
};

const DELTA_ICON = {
  up: MoveUp,
  down: MoveDown,
  flat: MoveRight,
} as const;

/**
 * Tarjeta de indicador.
 *
 * La variación nunca se comunica solo con color: lleva flecha y texto
 * ("+12% vs. periodo anterior"), porque el color por sí solo no llega a quien
 * no lo distingue ni a un lector de pantalla.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  href,
  linkLabel,
}: Props) {
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground">{label}</h3>
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 text-3xl font-black tracking-tight tabular-nums text-foreground">
        {value}
      </p>

      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}

      {delta && DeltaIcon && (
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold",
            delta.direction === "up" && "text-emerald-700",
            delta.direction === "down" && "text-destructive",
            delta.direction === "flat" && "text-muted-foreground",
          )}
        >
          <DeltaIcon className="size-3.5" aria-hidden="true" />
          {delta.label}
        </p>
      )}

      {href && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          {linkLabel ?? "Ver detalle"}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      )}
    </>
  );

  const className =
    "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm";

  if (!href) return <article className={className}>{body}</article>;

  return (
    <Link
      href={href}
      className={cn(
        className,
        "transition-colors hover:border-primary/40 hover:bg-accent/30",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      {body}
    </Link>
  );
}
