import { ShieldCheck, ShieldX, ShieldAlert, CalendarDays, User, BookOpen, Hash, Award, RotateCcw, Building2, IdCard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, getCertificateEffectiveStatus } from "@/lib/utils";
import { CertificateSearchForm } from "@/components/public/CertificateSearchForm";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: { absolute: "Resultado de verificación | RIVISIG Consultores" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

type Props = { params: Promise<{ code: string }> };

export default async function VerifyCertificateResultPage({ params }: Props) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code).trim();

  const certificate = await prisma.certificate.findFirst({
    where: { verificationCode: { equals: decodedCode, mode: "insensitive" } },
    include: {
      enrollment: {
        include: {
          user: { select: { name: true, dni: true, company: true } },
          course: { select: { title: true, category: true } },
          examAttempts: {
            where: { passed: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      course: { select: { title: true, category: true } },
    },
  });

  const effectiveStatus = certificate
    ? getCertificateEffectiveStatus(certificate.status, certificate.expiresAt)
    : null;

  const isValid = effectiveStatus === "ACTIVE";
  const isExpired = effectiveStatus === "EXPIRED";
  const isRevoked = effectiveStatus === "REVOKED";

  const enrollment = certificate?.enrollment ?? null;
  const holderName = enrollment?.user.name ?? certificate?.holderName ?? "—";
  const holderDni = enrollment?.user.dni ?? certificate?.holderDni ?? null;
  const holderCompany = enrollment?.user.company ?? certificate?.holderCompany ?? null;
  const courseTitle = enrollment?.course.title ?? certificate?.certificateTitle ?? certificate?.course?.title ?? "—";
  const courseCategory =
    enrollment?.course.category ?? certificate?.course?.category ?? null;
  const subjectLabel = enrollment ? "Curso" : "Certificado";
  const score = enrollment?.examAttempts[0]?.score ?? null;

  return (
    <>
      {/* ── Hero compacto con buscador ────────────────────── */}
      <section className="bg-foreground text-primary-foreground border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/verificar"
                className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="size-3" />
                Nueva búsqueda
              </Link>
            </div>
            <p className="text-sm font-semibold text-primary-foreground/70 mb-3">
              Verificar otro certificado
            </p>
            <CertificateSearchForm defaultValue={decodedCode} />
          </div>
        </div>
      </section>

      {/* ── Resultado ─────────────────────────────────────── */}
      <section className="bg-muted/40 border-b border-border min-h-[60vh] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Status card */}
            {isValid && (
              <div className="bg-white rounded-2xl border-2 border-green-500 shadow-sm overflow-hidden">
                <div className="bg-green-50 border-b border-green-200 px-6 py-5 flex items-center gap-4">
                  <div className="size-12 rounded-full bg-green-100 border border-green-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 text-lg">Certificado Válido</p>
                    <p className="text-sm text-green-600">
                      Este certificado es auténtico y se encuentra vigente
                    </p>
                  </div>
                  <Badge className="ml-auto shrink-0 bg-green-600 hover:bg-green-600 text-white border-none text-xs">
                    ACTIVO
                  </Badge>
                </div>

                {/* Details */}
                <div className="px-6 divide-y divide-border/60">
                  {[
                    ...(holderCompany
                      ? [{ icon: Building2, label: "Empresa", value: holderCompany }]
                      : []),
                    { icon: User, label: "Titular", value: holderName },
                    ...(holderDni
                      ? [{ icon: IdCard, label: "DNI", value: holderDni }]
                      : []),
                    { icon: BookOpen, label: subjectLabel, value: courseTitle },
                    ...(courseCategory
                      ? [{ icon: Award, label: "Categoría", value: courseCategory }]
                      : []),
                    { icon: CalendarDays, label: "Fecha de emisión", value: formatDate(certificate!.issueDate) },
                    ...(certificate!.expiresAt
                      ? [{ icon: CalendarDays, label: "Válido hasta", value: formatDate(certificate!.expiresAt) }]
                      : [{ icon: CalendarDays, label: "Vigencia", value: "Sin fecha de vencimiento" }]),
                    ...(score !== null
                      ? [{ icon: Award, label: "Calificación", value: `${score.toFixed(0)} / 100` }]
                      : []),
                    { icon: Hash, label: "Código de verificación", value: certificate!.verificationCode },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3.5 gap-4">
                      <div className="flex items-center gap-2.5 text-muted-foreground shrink-0">
                        <item.icon className="size-3.5" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground text-right font-mono-if-code">
                        {item.label === "Código de verificación" ? (
                          <span className="font-mono tracking-wider">{item.value}</span>
                        ) : (
                          item.value
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-muted/30 border-t border-border/60">
                  <p className="text-xs text-center text-muted-foreground">
                    Emitido por RIVISIG Consultores · Plataforma de Capacitación Profesional
                  </p>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="bg-white rounded-2xl border-2 border-amber-400 shadow-sm overflow-hidden">
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-5 flex items-center gap-4">
                  <div className="size-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                    <ShieldAlert className="size-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800 text-lg">Certificado Vencido</p>
                    <p className="text-sm text-amber-600">
                      Este certificado existió y fue válido, pero su período de vigencia ha expirado
                    </p>
                  </div>
                  <Badge className="ml-auto shrink-0 bg-amber-500 hover:bg-amber-500 text-white border-none text-xs">
                    VENCIDO
                  </Badge>
                </div>

                <div className="px-6 divide-y divide-border/60">
                  {[
                    ...(holderCompany
                      ? [{ icon: Building2, label: "Empresa", value: holderCompany }]
                      : []),
                    { icon: User, label: "Titular", value: holderName },
                    ...(holderDni
                      ? [{ icon: IdCard, label: "DNI", value: holderDni }]
                      : []),
                    { icon: BookOpen, label: subjectLabel, value: courseTitle },
                    { icon: CalendarDays, label: "Fecha de emisión", value: formatDate(certificate!.issueDate) },
                    { icon: CalendarDays, label: "Venció el", value: formatDate(certificate!.expiresAt!) },
                    { icon: Hash, label: "Código de verificación", value: certificate!.verificationCode },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3.5 gap-4">
                      <div className="flex items-center gap-2.5 text-muted-foreground shrink-0">
                        <item.icon className="size-3.5" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground text-right">
                        {item.label === "Código de verificación" ? (
                          <span className="font-mono tracking-wider">{item.value}</span>
                        ) : item.label === "Venció el" ? (
                          <span className="text-amber-600">{item.value}</span>
                        ) : (
                          item.value
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-amber-50/60 border-t border-amber-200/60">
                  <p className="text-xs text-center text-amber-700">
                    El titular puede contactar a RIVISIG Consultores para renovar su certificación.
                  </p>
                </div>
              </div>
            )}

            {!certificate && (
              <div className="bg-white rounded-2xl border-2 border-destructive shadow-sm overflow-hidden">
                <div className="bg-red-50 border-b border-red-200 px-6 py-5 flex items-center gap-4">
                  <div className="size-12 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                    <ShieldX className="size-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800 text-lg">Certificado No Encontrado</p>
                    <p className="text-sm text-red-600">
                      No existe ningún certificado con este código en nuestra base de datos
                    </p>
                  </div>
                  <Badge variant="destructive" className="ml-auto shrink-0 text-xs">
                    INVÁLIDO
                  </Badge>
                </div>

                <div className="px-6 py-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Código consultado</span>
                    <span className="text-sm font-mono font-semibold text-foreground tracking-wider">
                      {decodedCode}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Asegúrate de copiar el código exactamente como aparece en el certificado,
                    incluyendo los guiones (XXXX-XXXX-XXXX). Si el error persiste, el documento
                    podría no haber sido emitido por RIVISIG Consultores.
                  </p>
                </div>
              </div>
            )}

            {isRevoked && (
              <div className="bg-white rounded-2xl border-2 border-destructive shadow-sm overflow-hidden">
                <div className="bg-red-50 border-b border-red-200 px-6 py-5 flex items-center gap-4">
                  <div className="size-12 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                    <ShieldX className="size-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800 text-lg">Certificado Revocado</p>
                    <p className="text-sm text-red-600">
                      Este certificado ha sido revocado y ya no tiene validez
                    </p>
                  </div>
                  <Badge variant="destructive" className="ml-auto shrink-0 text-xs">
                    REVOCADO
                  </Badge>
                </div>
                <div className="px-6 py-5">
                  <p className="text-xs text-muted-foreground">
                    Código consultado:{" "}
                    <span className="font-mono font-semibold">{decodedCode}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="text-center">
              <Link
                href="/verificar"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
              >
                <RotateCcw className="size-3.5" />
                Verificar otro certificado
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
