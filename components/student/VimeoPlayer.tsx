"use client";

import { vimeoEmbedUrl } from "@/lib/vimeo";

type Props = {
  /** Referencia guardada: `"123456789"` o `"123456789/hash"`. */
  video: string;
  title: string;
};

export function VimeoPlayer({ video, title }: Props) {
  const src = vimeoEmbedUrl(video);
  if (!src) return null;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-sm">
      <iframe
        src={src}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      />
    </div>
  );
}
