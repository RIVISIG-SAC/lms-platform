import type { LucideIcon } from "lucide-react";

/**
 * Tarjeta del trío fijo (grid de 3 columnas):
 * El reto — Compromiso de la Alta Dirección — Trabajo en equipo.
 */
export function StoryCard({
  title,
  text,
  imageUrl,
  Icon,
}: {
  title: string;
  text: string;
  imageUrl?: string | null;
  Icon: LucideIcon;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5">
      {imageUrl && (
        <div className="overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-5 text-primary" aria-hidden="true" />
          </span>
          <h3 className="text-base font-bold leading-snug tracking-tight text-foreground">{title}</h3>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </article>
  );
}
