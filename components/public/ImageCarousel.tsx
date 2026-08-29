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
    const amount = (slide?.offsetWidth ?? 288) + 16;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img) => (
          <div
            key={img.id}
            data-slide
            className="snap-start shrink-0 w-64 sm:w-72 aspect-4/3 rounded-xl overflow-hidden border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 border border-border shadow-sm items-center justify-center hover:bg-white transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 border border-border shadow-sm items-center justify-center hover:bg-white transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
