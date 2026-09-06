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
  const hasText = Boolean(quote || authorName || authorRole);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm">
      <div className={`grid grid-cols-1 ${hasText ? "lg:grid-cols-12" : ""}`}>
        <div className={`p-4 sm:p-6 ${hasText ? "lg:col-span-7 lg:pr-3" : ""}`}>
          <VimeoPlayer videoId={vimeoId} title={title} />
        </div>

        {hasText && (
          <figure className="flex flex-col justify-center border-t border-border/70 p-6 sm:p-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8">
            <Quote className="size-7 shrink-0 text-primary/70" aria-hidden="true" />

            {quote && (
              <blockquote className="mt-4 text-lg font-medium leading-relaxed text-foreground sm:text-xl sm:leading-relaxed">
                {quote}
              </blockquote>
            )}

            {(authorName || authorRole) && (
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                <span className="h-9 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>
                  {authorName && <span className="block text-sm font-semibold text-foreground">{authorName}</span>}
                  {authorRole && (
                    <span className="mt-0.5 block text-xs uppercase tracking-wider text-muted-foreground">
                      {authorRole}
                    </span>
                  )}
                </span>
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </div>
  );
}
