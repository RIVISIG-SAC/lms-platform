import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, ChevronRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  id: string;
  title: string;
  description: string;
  price: number | string | { toNumber(): number };
  thumbnailUrl?: string | null;
  moduleCount: number;
  href: string;
  badge?: React.ReactNode;
};

export function CourseCard({
  id: _id,
  title,
  description,
  price,
  thumbnailUrl,
  moduleCount,
  href,
  badge,
}: Props) {
  return (
    <Link
      href={href}
      className="group bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden relative border-b border-border/50">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <BookOpen className="size-10 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-xs font-bold flex items-center gap-1">
            Ver detalles <ChevronRight className="size-3" />
          </span>
        </div>
        {badge && <div className="absolute top-3 right-3 shadow-lg">{badge}</div>}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 font-medium mb-6">
            {description}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase tracking-tight">
            <Layers className="size-4 text-primary/60" />
            <span>{moduleCount} {moduleCount === 1 ? "módulo" : "módulos"}</span>
          </div>
          <Badge variant="outline" className="font-black text-sm border-none bg-primary/5 text-primary px-3 py-1">
            {formatCurrency(price)}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
