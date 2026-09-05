import Link from "next/link";
import { ArrowRight, BookOpen, Home, ShieldCheck } from "lucide-react";
import { SiteNavbar } from "./(public)/_components/SiteNavbar";
import { SiteFooter } from "./(public)/_components/SiteFooter";
import { PetMascot } from "@/components/public/PetMascot";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: { absolute: "Página no encontrada | RIVISIG Consultores" },
  robots: { index: false, follow: true },
};

const ATAJOS = [
  {
    href: "/cursos",
    icon: BookOpen,
    title: "Catálogo de cursos",
    desc: "Formación en ISO 9001, 45001, 27001 y más.",
  },
  {
    href: "/verificar",
    icon: ShieldCheck,
    title: "Verificar certificado",
    desc: "Confirma la autenticidad de un certificado emitido.",
  },
  {
    href: "/servicios",
    icon: ArrowRight,
    title: "Servicios",
    desc: "Consultoría, auditorías y homologaciones.",
  },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />

      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="order-2 text-center lg:order-1 lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Error 404
                </p>
                <h1 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Esta página no{" "}
                  <span className="text-foreground/35">existe</span>
                </h1>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
                  Puede que el enlace esté mal escrito o que el contenido haya
                  cambiado de sitio. Te dejamos por dónde seguir.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link
                    href="/"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "gap-2 font-semibold",
                    )}
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

              <div className="order-1 flex justify-center lg:order-2">
                <PetMascot
                  size={360}
                  priority
                  className="h-auto w-56 drop-shadow-2xl sm:w-72 lg:w-[360px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Quizá buscabas
            </h2>

            <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
              {ATAJOS.map(({ href, icon: Icon, title, desc }) => (
                <Link key={href} href={href} className="group">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                  <div className="mt-5 h-px bg-border transition-colors group-hover:bg-primary/50" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
