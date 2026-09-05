import Link from "next/link";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronLeft,
  Hash,
  IdCard,
  User,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, getCertificateEffectiveStatus } from "@/lib/utils";
import { CertificateSearchForm } from "@/components/public/CertificateSearchForm";
import {
  CertificateResult,
  type EstadoVerificacion,
  type FilaCertificado,
} from "@/components/public/CertificateResult";

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

  const estado: EstadoVerificacion = certificate
    ? getCertificateEffectiveStatus(certificate.status, certificate.expiresAt)
    : "NOT_FOUND";

  const enrollment = certificate?.enrollment ?? null;
  const holderName = enrollment?.user.name ?? certificate?.holderName ?? "—";
  const holderDni = enrollment?.user.dni ?? certificate?.holderDni ?? null;
  const holderCompany =
    enrollment?.user.company ?? certificate?.holderCompany ?? null;
  const courseTitle =
    enrollment?.course.title ??
    certificate?.certificateTitle ??
    certificate?.course?.title ??
    "—";
  const courseCategory =
    enrollment?.course.category ?? certificate?.course?.category ?? null;
  const subjectLabel = enrollment ? "Curso" : "Certificado";
  const score = enrollment?.examAttempts[0]?.score ?? null;

  // Un certificado sin emitir o revocado no expone los datos del titular
  const muestraDatos = estado === "ACTIVE" || estado === "EXPIRED";

  const filas: FilaCertificado[] = muestraDatos
    ? [
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
        ...(score !== null
          ? [
              {
                icon: Award,
                label: "Calificación",
                value: `${score.toFixed(0)} / 100`,
              },
            ]
          : []),
        {
          icon: CalendarDays,
          label: "Fecha de emisión",
          value: formatDate(certificate!.issueDate),
        },
        certificate!.expiresAt
          ? {
              icon: CalendarDays,
              label: estado === "EXPIRED" ? "Venció el" : "Válido hasta",
              value: formatDate(certificate!.expiresAt),
              tone: estado === "EXPIRED" ? ("amber" as const) : undefined,
            }
          : {
              icon: CalendarDays,
              label: "Vigencia",
              value: "Sin fecha de vencimiento",
            },
        {
          icon: Hash,
          label: "Código de verificación",
          value: certificate!.verificationCode,
          mono: true,
        },
      ]
    : [
        {
          icon: Hash,
          label: "Código consultado",
          value: decodedCode,
          mono: true,
        },
      ];

  const notas: Record<EstadoVerificacion, React.ReactNode> = {
    ACTIVE: (
      <p className="text-center text-xs text-muted-foreground">
        Emitido por RIVISIG Consultores · Plataforma de capacitación profesional
      </p>
    ),
    EXPIRED: (
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        El titular puede volver a llevar el curso para renovar su certificación.{" "}
        <Link href="/cursos" className="font-semibold text-primary hover:underline">
          Ver cursos
        </Link>
      </p>
    ),
    PENDING_PAYMENT: (
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Este código quedará activo en cuanto el titular complete el pago del
        certificado.
      </p>
    ),
    REVOKED: (
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Si necesitas más información sobre esta revocación, escríbenos a{" "}
        <a
          href="mailto:info@rivisig.com"
          className="font-semibold text-primary hover:underline"
        >
          info@rivisig.com
        </a>
        .
      </p>
    ),
    NOT_FOUND: (
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Copia el código tal como aparece en el certificado, incluidos los
        guiones. Si el error persiste, el documento podría no haber sido emitido
        por RIVISIG Consultores.
      </p>
    ),
  };

  return (
    <section>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/verificar"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Portal de verificación
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
          Resultado
        </p>
        <h1 className="mt-1.5 font-mono text-2xl font-black tracking-widest text-foreground sm:text-3xl">
          {decodedCode}
        </h1>

        <div className="mt-6">
          <CertificateResult
            estado={estado}
            filas={filas}
            nota={notas[estado]}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <p className="mb-3 text-sm font-bold text-foreground">
            Verificar otro certificado
          </p>
          <CertificateSearchForm />
        </div>
      </div>
    </section>
  );
}
