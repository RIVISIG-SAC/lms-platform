import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  description: string;
  price: number | string | { toNumber(): number };
  thumbnailUrl?: string | null;
  moduleCount: number;
  chapterCount: number;
};

export function LandingCourseCard({ id, title, description, price, thumbnailUrl, moduleCount, chapterCount }: Props) {
  return (
    <Link href={`/cursos/${id}`} className="group block">
      <Card className="h-full overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 gap-0 py-0">
        {/* Thumbnail */}
        <div className="aspect-video overflow-hidden bg-muted">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
              <span className="text-5xl opacity-20 select-none">📚</span>
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-1">
          <h3 className="font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs font-normal">
              {moduleCount} módulos
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              {chapterCount} clases
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              180 días de acceso
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="px-5 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Certificado al aprobar</span>
          <span className="text-lg font-bold text-foreground">{formatCurrency(price)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
