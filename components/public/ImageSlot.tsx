"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  /** Tailwind aspect ratio class — e.g. `aspect-[4/3]`, `aspect-video`, `aspect-square`. */
  aspect?: string;
  /** Hint shown in the placeholder so the team knows what image belongs here. */
  hint?: string;
  className?: string;
  priority?: boolean;
  rounded?: string;
  /** When true, Image uses `fill` + `object-cover`. Default: true. */
  cover?: boolean;
  sizes?: string;
};

export function ImageSlot({
  src,
  alt,
  aspect = "aspect-[4/3]",
  hint,
  className,
  priority = false,
  rounded = "rounded-xl",
  cover = true,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: Props) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-muted/40",
        aspect,
        rounded,
        className
      )}
    >
      {!errored ? (
        <Image
          src={src}
          alt={alt}
          fill={cover}
          width={cover ? undefined : 1200}
          height={cover ? undefined : 800}
          className={cn(cover && "object-cover")}
          sizes={sizes}
          priority={priority}
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center bg-linear-to-br from-muted to-background">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs font-mono text-foreground/80 break-all">{src}</p>
          {hint && <p className="text-xs text-muted-foreground max-w-xs">{hint}</p>}
        </div>
      )}
    </div>
  );
}
