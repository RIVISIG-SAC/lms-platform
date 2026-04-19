import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-border/60 bg-accent/10 p-10",
        className
      )}
    >
      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="size-6 text-primary/70" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
