import Link from "next/link";
import { CheckCircle2, FileSearch, Globe, QrCode, ShieldCheck } from "lucide-react";
import { CertificateSearchForm } from "@/components/public/CertificateSearchForm";

export const metadata = {
  title: { absolute: "Verificar Certificado | RIVISIG Consultores" },
  description:
    "Verifica la autenticidad de cualquier certificado emitido por RIVISIG Consultores ingresando el código de verificación.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com"}/verificar`,
  },
};

const PASOS = [
  {
    icon: QrCode,
    title: "Localiza el código",
    desc: "Está en la parte inferior del certificado PDF, con el formato XXXX-XXXX-XXXX.",
  },
  {
    icon: FileSearch,
    title: "Ingrésalo arriba",
    desc: "Escríbelo o pégalo en el buscador. No distinguimos mayúsculas ni guiones.",
  },
  {
    icon: Globe,
    title: "Consulta el resultado",
    desc: "Verás el titular, el curso, la fecha de emisión y la vigencia del certificado.",
  },
];

const GARANTIAS = [
  "Consulta en tiempo real contra nuestra base de datos.",
  "Código único e intransferible por cada certificado emitido.",
  "Abierto a empleadores, clientes y auditores, sin necesidad de cuenta.",
];

export default function VerificarPage() {
  return (
    <>
      {/* Buscador */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Portal de verificación
            </p>
            <h1 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Verifica la autenticidad de un{" "}
              <span className="text-foreground/35">certificado</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Ingresa el código del certificado para confirmar que fue emitido
              oficialmente por RIVISIG Consultores y que sigue vigente.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-card p-5 sm:p-6">
            <CertificateSearchForm autoFocus />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              El código aparece al pie del PDF, con el formato XXXX-XXXX-XXXX.
            </p>
          </div>
        </div>
      </section>

      {/* Cómo verificar */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Cómo funciona
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Tres pasos y unos segundos
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {PASOS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="group">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Paso {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
                <div className="mt-5 h-px bg-border transition-colors group-hover:bg-primary/50" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garantía */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </span>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Garantía de autenticidad
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Cada certificado que emitimos lleva un código único ligado al
                titular y al curso. Verificarlo aquí es la única forma de
                confirmar que un documento es nuestro.
              </p>
            </div>

            <ul className="space-y-4 lg:pt-4">
              {GARANTIAS.map((punto) => (
                <li
                  key={punto}
                  className="flex items-start gap-3 border-b border-border pb-4 last:border-0"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground/80">
                    {punto}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
            ¿Buscas formación certificada?{" "}
            <Link
              href="/cursos"
              className="font-semibold text-primary hover:underline"
            >
              Explora nuestros cursos
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
