"use client";

type Props = {
  videoId: string;
  title: string;
};

export function VimeoPlayer({ videoId, title }: Props) {
  return (
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?color=2563eb&title=0&byline=0&portrait=0`}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      />
    </div>
  );
}
