import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { BuyButton } from "@/components/landing/BuyButton";
import { enrollFree } from "@/app/actions/enrollments";
import { ArrowRight } from "lucide-react";
import type { CourseDetail } from "./types";

type SessionLike = { userId: string } | null;

type Props = {
  course: CourseDetail;
  session: SessionLike;
  isPaid: boolean;
};

export function MobileStickyCta({ course, session, isPaid }: Props) {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      role="region"
      aria-label="Acceso rápido a compra"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {course.isFree ? (
            <>
              <p className="text-lg font-bold text-green-600 leading-tight">Gratis</p>
              <p className="text-[11px] text-muted-foreground truncate">
                Cert. S/. {Number(course.certificateFee ?? 0).toFixed(2)} al aprobar
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground leading-tight tracking-tight">
                {formatCurrency(course.price)}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Certificado incluido · 180 días
              </p>
            </>
          )}
        </div>

        <div className="shrink-0 min-w-[140px]">
          {isPaid ? (
            <Link
              href={`/student/courses/${course.id}`}
              className={cn(buttonVariants(), "h-10 px-4 gap-1.5 text-sm")}
            >
              Ir al curso <ArrowRight className="size-4" />
            </Link>
          ) : course.isFree ? (
            session ? (
              <form action={enrollFree.bind(null, course.id)}>
                <button
                  type="submit"
                  className="h-10 px-4 bg-green-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Inscribirse
                </button>
              </form>
            ) : (
              <Link
                href={`/login?next=/cursos/${course.id}`}
                className={cn(buttonVariants(), "h-10 px-4 text-sm")}
              >
                Iniciar sesión
              </Link>
            )
          ) : session ? (
            <BuyButton courseId={course.id} price={Number(course.price)} />
          ) : (
            <Link
              href={`/registro?next=/cursos/${course.id}`}
              className={cn(buttonVariants(), "h-10 px-4 text-sm")}
            >
              Comprar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
