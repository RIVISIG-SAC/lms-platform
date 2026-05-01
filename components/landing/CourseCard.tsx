import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, User } from "lucide-react";

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
            <div className="w-full h-full bg-linear-to-br from-primary/80 to-primary flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/20" />
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-1">
          <h3 className="text-base font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
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

        {instructor && (
          <div className="px-5 pb-3 flex items-center gap-2">
            {instructor.avatarUrl ? (
              <Image
                src={instructor.avatarUrl}
                alt={instructor.name}
                width={20}
                height={20}
                className="size-5 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-3 text-primary" />
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">{instructor.name}</span>
          </div>
        )}

        <CardFooter className="px-5 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Certificado al aprobar</span>
          <span className="text-lg font-bold text-foreground">{formatCurrency(price)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
