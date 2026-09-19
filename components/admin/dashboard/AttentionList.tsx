import Link from "next/link";
import { CheckCircle2, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AttentionItem = {
  label: string;
  /** Qué implica el número; evita que el admin tenga que adivinarlo. */
  detail: string;
  count: number;
  icon: LucideIcon;
  href: string;
  /** `alta` sale primero y se marca como urgente. */
  severity: "alta" | "media";
};

type Props = { items: AttentionItem[] };

/**
 * Cola de pendientes operativos.
 *
 * Solo aparece lo que tiene algo que hacer: una lista de ceros es ruido. La
 * urgencia se indica con la palabra "Urgente" además del color, para no
 * apoyarse únicamente en él.
 */
export function AttentionList({ items }: Props) {
  const pendientes = items
    .filter((item) => item.count > 0)
    .sort((a, b) =>
      a.severity === b.severity
        ? b.count - a.count
        : a.severity === "alta"
          ? -1
          : 1,
    );

  return (
    <section
      aria-labelledby="attention-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <h2 id="attention-title" className="text-base font-bold text-foreground">
        Requiere atención
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {pendientes.length === 0
          ? "Nada pendiente ahora mismo."
          : `${pendientes.length} ${pendientes.length === 1 ? "asunto abierto" : "asuntos abiertos"}.`}
      </p>

      {pendientes.length === 0 ? (
        <p className="mt-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          Todo al día: sin consultas sin responder ni cursos incompletos.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {pendientes.map((item) => {
            const Icon = item.icon;
            const urgente = item.severity === "alta";

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    urgente
                      ? "border-amber-300 bg-amber-50/60 hover:bg-amber-50"
                      : "border-border bg-background hover:border-primary/40 hover:bg-accent/30",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                      urgente
                        ? "bg-amber-100 text-amber-800"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      {urgente && (
                        <span className="rounded-full bg-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                          Urgente
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>

                  <span className="shrink-0 text-lg font-black tabular-nums text-foreground">
                    {item.count}
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
