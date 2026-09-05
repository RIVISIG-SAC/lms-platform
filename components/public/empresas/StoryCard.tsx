import type { LucideIcon } from "lucide-react";

/**
 * Tarjeta del trío fijo (grid de 3 columnas):
 * El reto — Compromiso de la Alta Dirección — Trabajo en equipo.
 */
export function StoryCard({
  index,
  title,
  text,
  imageUrl,
  Icon,
}: {
  index: string;
  title: string;
  text: string;
  imageUrl?: string | null;
  Icon: LucideIcon;
}) {
  return (
    <article className="group flex h-full flex-col bg-card">
      {imageUrl && (
        <div className="overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="aspect-4/3 w-full object-cover grayscale-[35%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col border-t-2 border-foreground p-6 transition-colors duration-300 group-hover:border-primary sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center border border-primary/25 bg-primary/5">
            <Icon className="size-5 text-primary" aria-hidden="true" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">{index}</span>
        </div>

        <h3 className="mt-5 text-lg font-bold leading-snug tracking-tight text-foreground">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </article>
  );
}
