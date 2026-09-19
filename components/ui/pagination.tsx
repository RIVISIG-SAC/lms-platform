"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { getPageWindow, type PaginationMeta } from "@/lib/pagination";

type Props = {
  meta: PaginationMeta;
  /** Nombre en singular/plural para el resumen ("curso" / "cursos"). */
  itemLabel?: { one: string; many: string };
  className?: string;
};

/**
 * Paginación por URL: cada página es un `<Link>` real, así funciona el
 * back/forward, el "abrir en pestaña nueva" y los lectores de pantalla.
 * Conserva el resto de parámetros (búsqueda y filtros) al cambiar de página.
 */
export function Pagination({ meta, itemLabel, className }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, totalPages, totalItems, from, to, hasPrev, hasNext } = meta;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) params.delete("page");
    else params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const label = itemLabel ?? { one: "registro", many: "registros" };
  const noun = totalItems === 1 ? label.one : label.many;

  if (totalItems === 0) return null;

  return (
    <nav
      aria-label="Paginación"
      className={cn(
        "flex flex-col-reverse items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:flex-row",
        className,
      )}
    >
      <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
        Mostrando <span className="font-bold text-foreground tabular-nums">{from}</span>
        {"–"}
        <span className="font-bold text-foreground tabular-nums">{to}</span> de{" "}
        <span className="font-bold text-foreground tabular-nums">{totalItems}</span> {noun}
      </p>

      {totalPages > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            <PageLink
              href={hrefFor(page - 1)}
              disabled={!hasPrev}
              ariaLabel="Página anterior"
              icon
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only sm:not-sr-only sm:ml-0.5">Anterior</span>
            </PageLink>
          </li>

          {getPageWindow(page, totalPages).map((target, i) =>
            target === null ? (
              <li key={`gap-${i}`} aria-hidden="true">
                <span className="flex size-8 items-center justify-center text-muted-foreground">
                  <MoreHorizontal className="size-4" />
                </span>
              </li>
            ) : (
              <li key={target} className="hidden sm:block">
                <Link
                  href={hrefFor(target)}
                  aria-label={`Ir a la página ${target}`}
                  aria-current={target === page ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: target === page ? "default" : "ghost",
                      size: "icon",
                    }),
                    "tabular-nums",
                  )}
                >
                  {target}
                </Link>
              </li>
            ),
          )}

          <li className="text-xs font-semibold text-muted-foreground tabular-nums sm:hidden">
            {page} / {totalPages}
          </li>

          <li>
            <PageLink
              href={hrefFor(page + 1)}
              disabled={!hasNext}
              ariaLabel="Página siguiente"
              icon
            >
              <span className="sr-only sm:not-sr-only sm:mr-0.5">Siguiente</span>
              <ChevronRight className="size-4" />
            </PageLink>
          </li>
        </ul>
      )}
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  ariaLabel,
  children,
}: {
  href: string;
  disabled: boolean;
  ariaLabel: string;
  icon?: boolean;
  children: React.ReactNode;
}) {
  const className = cn(
    buttonVariants({ variant: "ghost", size: "sm" }),
    "gap-1",
    disabled && "pointer-events-none opacity-40",
  );

  // Un extremo deshabilitado deja de ser enlace: no debe recibir foco ni
  // anunciarse como destino navegable.
  if (disabled) {
    return (
      <span className={className} aria-disabled="true" aria-label={ariaLabel}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={className} scroll>
      {children}
    </Link>
  );
}
