import Link from "next/link";
import { ArrowUpRight, BookOpen, Calendar, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string } | null;
  tags?: { tag: { name: string; slug: string } }[];
  featured?: boolean;
};

export function BlogPostCard({
  slug,
  title,
  excerpt,
  coverImageUrl,
  publishedAt,
  category,
  author,
  tags,
  featured = false,
}: Props) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <Card
        className={`h-full overflow-hidden border-border/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 gap-0 py-0 rounded-2xl ${
          featured ? "md:grid md:grid-cols-2" : ""
        }`}
      >
        <div className={`overflow-hidden bg-muted relative ${featured ? "aspect-video md:aspect-auto md:h-full" : "aspect-video"}`}>
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/90 via-primary to-foreground flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/25" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
          {category && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/95 text-foreground border-0 text-[11px] font-semibold gap-1">
                <TagIcon className="size-3" />
                {category.name}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className={`p-5 sm:p-6 flex flex-col ${featured ? "md:p-8 md:justify-center" : ""}`}>
          {publishedAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
              <Calendar className="size-3" />
              {formatDate(publishedAt)}
              {author && <span className="ml-1.5 before:content-['·'] before:mr-1.5">{author.name}</span>}
            </div>
          )}

          <h3
            className={`font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors duration-300 ${
              featured ? "text-2xl sm:text-3xl line-clamp-3" : "text-lg sm:text-xl line-clamp-2"
            }`}
          >
            {title}
          </h3>

          {excerpt && (
            <p
              className={`text-muted-foreground leading-relaxed mb-4 ${
                featured ? "text-base line-clamp-3" : "text-sm line-clamp-2"
              }`}
            >
              {excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags?.slice(0, 3).map((t) => (
                <Badge key={t.tag.slug} variant="secondary" className="text-[10px] font-medium">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Leer <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
