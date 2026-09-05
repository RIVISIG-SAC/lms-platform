import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PetMascot } from "@/components/public/PetMascot";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: { absolute: "Recurso no encontrado | RIVISIG Consultores" },
  robots: { index: false, follow: false },
};

/** 404 dentro del panel: se muestra sobre el shell, con la sesión ya resuelta. */
export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-accent/10 px-6 py-16 text-center">
      <PetMascot size={180} className="h-auto w-32 sm:w-40" />

      <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-primary">
        Error 404
      </p>
      <h1 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
        Este recurso no está disponible
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Puede que haya sido eliminado o que no tengas acceso a él.
      </p>

      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-6 gap-2 font-semibold",
        )}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver
      </Link>
    </div>
  );
}
