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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      <VimeoPlayer videoId={vimeoId} title={title} />
      {(quote || authorName) && (
        <div className="space-y-4">
          {quote && <p className="text-lg text-foreground leading-relaxed">&ldquo;{quote}&rdquo;</p>}
          {(authorName || authorRole) && (
            <div>
              {authorName && <p className="font-semibold text-foreground">{authorName}</p>}
              {authorRole && <p className="text-sm text-muted-foreground">{authorRole}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
