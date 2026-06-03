import { ShieldCheck, CheckCircle2, QrCode, Globe } from "lucide-react";
import { CertificateSearchForm } from "@/components/public/CertificateSearchForm";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: { absolute: "Verificar Certificado | RIVISIG Consultores" },
  description:
    "Verifica la autenticidad de cualquier certificado emitido por RIVISIG Consultores ingresando el código de verificación.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com"}/verificar` },
};

const HOW_IT_WORKS = [
  {
    icon: QrCode,
    title: "Localiza el código",
    desc: "Encuéntralo en la parte inferior del certificado PDF, en formato XXXX-XXXX-XXXX.",
  },
  {
    icon: ShieldCheck,
    title: "Ingresa el código",
    desc: "Escribe o pega el código en el campo de búsqueda y presiona Verificar.",
  },
  {
    icon: Globe,
    title: "Obtén el resultado",
    desc: "Verás los datos del titular, el curso y la fecha de emisión confirmados.",
  },
];

const TRUST_POINTS = [
  "Verificación en tiempo real contra nuestra base de datos",
  "Resultados instantáneos y transparentes",
  "Código único e intransferible por cada certificado",
];

export default function VerificarPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-foreground text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Badge
              variant="outline"
              className="border-primary/40 text-primary bg-primary/10 text-xs font-medium px-3 py-1"
            >
              <ShieldCheck className="size-3 mr-1.5" />
              Portal de Verificación
            </Badge>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Verifica la autenticidad de un{" "}
              <span className="text-primary">certificado</span>
            </h1>

            <p className="text-base text-primary-foreground/70 leading-relaxed">
              Ingresa el código de verificación del certificado para confirmar
              que fue emitido oficialmente por RIVISIG Consultores y que se
              encuentra vigente.
            </p>

            <div className="pt-2">
              <CertificateSearchForm />
              <p className="text-xs text-primary-foreground/40 mt-3">
                El código tiene el formato XXXX-XXXX-XXXX y lo encontrarás en
                el certificado PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Proceso
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              ¿Cómo verificar un certificado?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.title}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm flex gap-4"
              >
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <step.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Paso {i + 1}
                  </p>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="size-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Garantía de autenticidad
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cada certificado emitido por nuestra plataforma incluye un código
              único e infalsificable. Empleadores, clientes y auditores pueden
              verificarlo aquí en segundos.
            </p>
            <ul className="space-y-2 text-left">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
