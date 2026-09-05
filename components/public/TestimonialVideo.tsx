import { Quote } from "lucide-react";
import { VimeoPlayer } from "@/components/student/VimeoPlayer";

type Props = {
  vimeoId: string;
  title: string;
  quote?: string | null;
  authorName?: string | null;
  authorRole?: string | null;
};

export function TestimonialVideo({ vimeoId, title, quote, authorName, authorRole }: Props) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <div className="overflow-hidden border border-border bg-foreground">
          <VimeoPlayer videoId={vimeoId} title={title} />
        </div>
      </div>

      {(quote || authorName) && (
        <blockquote className="lg:col-span-5">
          <Quote className="size-8 text-primary" aria-hidden="true" />
          {quote && (
            <p className="font-black mt-5 text-2xl leading-[1.3] tracking-tight text-foreground sm:text-[1.9rem]">
              {quote}
            </p>
          )}
          {(authorName || authorRole) && (
            <footer className="mt-7 border-t border-border pt-5">
              {authorName && <p className="text-sm font-semibold text-foreground">{authorName}</p>}
              {authorRole && (
                <p className="font-semibold mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {authorRole}
                </p>
              )}
            </footer>
          )}
        </blockquote>
      )}
    </div>
  );
}
