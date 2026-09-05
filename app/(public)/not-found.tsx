import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { PetMascot } from "@/components/public/PetMascot";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: { absolute: "Contenido no encontrado | RIVISIG Consultores" },
  robots: { index: false, follow: true },
};

/** 404 de los recursos públicos (curso, post, empresa o instructor inexistente). */
export default function PublicNotFound() {
  return (
    <section>
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28">
        <PetMascot size={220} className="h-auto w-40 sm:w-52" />

        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-4xl">
          No encontramos este{" "}
          <span className="text-foreground/35">contenido</span>
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          Es posible que se haya despublicado o que el enlace ya no sea válido.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 font-semibold")}
          >
            <Home className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
          <Link
            href="/cursos"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "gap-2 font-semibold",
            )}
          >
            Ver cursos
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
