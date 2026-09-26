import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { courseSlugFromNextPath } from "@/lib/navigation/next-path";

type Stage = "registro" | "verificar" | "verificado";

const CAPTION: Record<Stage, { purchase: string; free: string }> = {
  registro: {
    purchase: "Estás a un paso de comprar",
    free: "Estás a un paso de inscribirte en",
  },
  verificar: {
    purchase: "Al verificar e iniciar sesión volverás a completar tu compra de",
    free: "Al verificar e iniciar sesión quedarás inscrito en",
  },
  verificado: {
    purchase: "Inicia sesión para completar tu compra de",
    free: "Inicia sesión para empezar",
  },
};

/**
 * Recuerda al visitante el curso que eligió mientras pasa por registro →
 * verificación → login, para que no pierda el hilo de la compra. No muestra
 * nada si `next` no apunta a un curso publicado.
 */
export async function CourseIntentCard({ next, stage }: { next?: string; stage: Stage }) {
  const slug = courseSlugFromNextPath(next);
  if (!slug) return null;

  const course = await prisma.course.findFirst({
    where: { published: true, OR: [{ slug }, { id: slug }] },
    select: { title: true, price: true, isFree: true },
  });
  if (!course) return null;

  const caption = CAPTION[stage][course.isFree ? "free" : "purchase"];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 text-left">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BookOpen className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{caption}</p>
        <p className="truncate text-sm font-semibold text-foreground">{course.title}</p>
        <p className="text-xs font-medium text-foreground/70">
          {course.isFree ? "Gratis" : formatCurrency(course.price)}
        </p>
      </div>
    </div>
  );
}
