"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type GalleryImage = { url: string; alt: string; caption?: string | null };

export function CompanyGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black border-none" showCloseButton>
          {current && (
            <div className="relative">
              <div className="relative aspect-video w-full">
                <Image src={current.url} alt={current.alt} fill className="object-contain" sizes="100vw" />
              </div>
              {current.caption && <p className="text-center text-sm text-white/80 py-3 px-4">{current.caption}</p>}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenIndex((i) => (i === null ? 0 : (i + 1) % images.length))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white"
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
