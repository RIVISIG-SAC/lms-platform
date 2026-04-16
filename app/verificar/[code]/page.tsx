import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ code: string }> };

export const metadata = { title: "Verificación de Certificado | Cursos Pro" };

export default async function VerifyCertificatePage({ params }: Props) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: {
      enrollment: {
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
          examAttempts: {
            where: { passed: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const isValid = certificate && certificate.status === "ACTIVE";
  const score = certificate?.enrollment.examAttempts[0]?.score ?? null;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Cursos Pro</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Verificación de Certificados
          </p>
        </div>

        {isValid ? (
          <div className="bg-white border-2 border-green-500 rounded-2xl p-8 shadow-sm space-y-6">
            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-semibold text-green-800 text-lg">Certificado Válido</p>
                <p className="text-sm text-green-600">
                  Este certificado es auténtico y está activo
                </p>
              </div>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {[
                { label: "Titular", value: certificate.enrollment.user.name },
                { label: "Curso", value: certificate.enrollment.course.title },
                { label: "Fecha de emisión", value: formatDate(certificate.issueDate) },
                ...(score !== null ? [{ label: "Calificación", value: `${score.toFixed(0)}%` }] : []),
                { label: "Código de verificación", value: certificate.verificationCode },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-3">
                  <span className="text-sm text-[var(--muted-foreground)]">{item.label}</span>
                  <span className="text-sm font-medium text-[var(--foreground)] text-right max-w-xs">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
              Emitido por Cursos Pro · Plataforma de Capacitación Profesional
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 border-red-400 rounded-2xl p-8 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mx-auto">
              ✕
            </div>
            <div>
              <p className="font-semibold text-red-800 text-lg">Certificado No Válido</p>
              <p className="text-sm text-red-600 mt-1">
                {certificate?.status === "REVOKED"
                  ? "Este certificado ha sido revocado."
                  : "No se encontró ningún certificado con este código."}
              </p>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Código consultado:{" "}
              <span className="font-mono font-medium">{code}</span>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          Para verificar un certificado, ingresa la URL completa con el código de verificación.
        </p>
      </div>
    </div>
  );
}
