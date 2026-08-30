"use client";

type Props = {
  videoId: string;
  title: string;
};

export function VimeoPlayer({ videoId, title }: Props) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-sm">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?color=cd3429&title=0&byline=0&portrait=0`}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      />
    </div>
  );
}
