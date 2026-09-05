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
    const amount = (slide?.offsetWidth ?? 320) + 12;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <figure
            key={img.id}
            data-slide
            className="group relative aspect-4/3 w-72 shrink-0 snap-start overflow-hidden bg-muted sm:w-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt}
              loading="lazy"
              className="size-full object-cover grayscale-[30%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
            />
            <figcaption className="font-semibold absolute bottom-0 left-0 bg-foreground/80 px-2 py-1 text-[10px] tracking-[0.2em] text-background">
              {String(i + 1).padStart(2, "0")}
            </figcaption>
          </figure>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-4 hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            className="flex size-10 items-center justify-center border border-border transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            className="flex size-10 items-center justify-center border border-border transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            aria-label="Siguiente"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
