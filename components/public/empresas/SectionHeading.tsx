import { cn } from "@/lib/utils";

type Tone = "ink" | "paper";

/** Etiqueta de sección: filete rojo + texto en versalitas. */
export function Eyebrow({
  tone = "paper",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em]",
        tone === "ink" ? "text-background/55" : "text-muted-foreground",
        className,
      )}
    >
      <span className="h-px w-7 bg-primary" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Cabecera de sección: etiqueta + titular + entradilla opcional. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "paper",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  tone?: Tone;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "flex flex-col items-center text-center", className)}>
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "mt-5 text-2xl font-black leading-[1.1] tracking-tight sm:text-3xl lg:text-4xl",
          tone === "ink" ? "text-background" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "mt-4 max-w-2xl text-[0.95rem] leading-relaxed",
            tone === "ink" ? "text-background/60" : "text-muted-foreground",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
