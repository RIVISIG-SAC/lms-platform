"use client";

import { cn } from "@/lib/utils";
import { useTableParams } from "@/components/admin/filters/use-table-params";

type Option = { value: string; label: string };

type Props = {
  param: string;
  options: Option[];
  className?: string;
};

/** Grupo de botones excluyentes (Todos / Publicados / Borradores). */
export function SegmentedFilter({ param, options, className }: Props) {
  const { getParam, setParams } = useTableParams();
  const active = getParam(param, "all");

  return (
    <div
      role="group"
      className={cn(
        "flex items-center rounded-lg border border-border bg-background p-0.5",
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={active === opt.value}
          onClick={() => setParams({ [param]: opt.value })}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            active === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
