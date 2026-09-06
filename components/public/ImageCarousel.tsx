"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselImage = { id: string; url: string; alt: string };

export function ImageCarousel({ images }: { images: CarouselImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  function scrollByAmount(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>("[data-slide]");
    const amount = (slide?.offsetWidth ?? 320) + 16;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img) => (
          <figure
            key={img.id}
            data-slide
            className="group relative aspect-4/3 w-64 shrink-0 snap-start overflow-hidden rounded-xl border border-border/70 bg-muted sm:w-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </figure>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            className="absolute -left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-white/95 text-foreground shadow-md shadow-black/10 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:flex sm:opacity-0 focus-visible:opacity-100 sm:group-hover/carousel:opacity-100"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            className="absolute -right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-white/95 text-foreground shadow-md shadow-black/10 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:flex sm:opacity-0 focus-visible:opacity-100 sm:group-hover/carousel:opacity-100"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
