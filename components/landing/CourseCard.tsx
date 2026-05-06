import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, BookOpen, User } from "lucide-react";

type InstructorInfo = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type Props = {
  id: string;
  title: string;
  description: string;
  price: number | string | { toNumber(): number };
  thumbnailUrl?: string | null;
  moduleCount: number;
  chapterCount: number;
  instructor?: InstructorInfo | null;
};

export function LandingCourseCard({ id, title, description, price, thumbnailUrl, moduleCount, chapterCount, instructor }: Props) {
  return (
    <Link
      href={`/cursos/${id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden border-border/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 gap-0 py-0 rounded-2xl">
        <div className="aspect-video overflow-hidden bg-muted relative">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/90 via-primary to-foreground flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/25" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className="bg-white/95 text-foreground border-0 text-[11px] font-semibold">{moduleCount} modulos</Badge>
            <Badge className="bg-black/50 text-white border border-white/20 text-[11px]">{chapterCount} clases</Badge>
          </div>
          <div className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
            Ver detalle <ArrowUpRight className="size-3.5" />
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 flex-1">
          <h3 className="text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <Badge variant="secondary" className="font-medium bg-muted/70 text-foreground">
              {moduleCount} modulos
            </Badge>
            <Badge variant="secondary" className="font-medium bg-muted/70 text-foreground">
              {chapterCount} clases
            </Badge>
            <Badge variant="secondary" className="font-medium bg-muted/70 text-foreground">
              180 días de acceso
            </Badge>
          </div>
        </CardContent>

        {instructor && (
          <div className="px-5 sm:px-6 pb-4 flex items-center gap-2">
            {instructor.avatarUrl ? (
              <Image
                src={instructor.avatarUrl}
                alt={instructor.name}
                width={20}
                height={20}
                className="size-6 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-3 text-primary" />
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">{instructor.name}</span>
          </div>
        )}

        <CardFooter className="px-5 sm:px-6 py-4 border-t border-border bg-muted/30 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Certificacion</p>
            <span className="text-xs text-foreground font-medium">Incluida al aprobar</span>
          </div>
          <span className="text-2xl font-extrabold text-foreground leading-none">{formatCurrency(price)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
