"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type GalleryImage = { url: string; alt: string; caption?: string | null };

export function CompanyGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-2 gap-2 sm:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className={`group relative overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              i === 0 ? "aspect-square sm:col-span-2 sm:row-span-2 sm:aspect-auto" : "aspect-4/3"
            }`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover grayscale-[30%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
            <span className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/25" />
            <span className="absolute right-3 top-3 flex size-8 items-center justify-center bg-background/95 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Expand className="size-3.5 text-foreground" aria-hidden="true" />
            </span>
            <span className="font-semibold absolute bottom-0 left-0 bg-foreground/80 px-2 py-1 text-[10px] tracking-[0.2em] text-background">
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="border-none bg-foreground p-0 sm:max-w-4xl" showCloseButton>
          {current && (
            <div className="relative">
              <div className="relative aspect-video w-full">
                <Image src={current.url} alt={current.alt} fill className="object-contain" sizes="100vw" />
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-background/15 px-5 py-3">
                <p className="text-sm text-background/75">{current.caption ?? current.alt}</p>
                <span className="font-semibold shrink-0 text-[11px] tracking-[0.2em] text-background/45">
                  {String((openIndex ?? 0) + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length))}
                    className="absolute left-3 top-[calc(50%-1.5rem)] flex size-10 -translate-y-1/2 items-center justify-center bg-foreground/70 text-background transition-colors hover:bg-primary"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenIndex((i) => (i === null ? 0 : (i + 1) % images.length))}
                    className="absolute right-3 top-[calc(50%-1.5rem)] flex size-10 -translate-y-1/2 items-center justify-center bg-foreground/70 text-background transition-colors hover:bg-primary"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
