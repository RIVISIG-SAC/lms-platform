import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CertificatePDF } from '@/lib/certificate-pdf';
import { getCertificateEffectiveStatus } from '@/lib/utils';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { getClientIp } from '@/lib/security/ip';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(ip, 'certificate:verify');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiadas verificaciones. Reintenta en ${rl.retryInSeconds}s.` },
      { status: 429 },
    );
  }

  const { code } = await params;
  const session = await getSession();

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: {
      enrollment: {
        include: {
          user: { select: { name: true, dni: true, company: true } },
          course: { select: { title: true, certificateDescription: true } },
          examAttempts: {
            where: { passed: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
      course: { select: { title: true, certificateDescription: true } },
    },
  });

  if (!certificate) {
    return NextResponse.json(
      { error: 'Certificado no encontrado' },
      { status: 404 },
    );
  }

  const effectiveStatus = getCertificateEffectiveStatus(
    certificate.status,
    certificate.expiresAt,
  );
  if (effectiveStatus !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Certificado no disponible o vencido' },
      { status: 404 },
    );
  }

  const enrollment = certificate.enrollment;

  if (
    session &&
    session.role !== 'ADMIN' &&
    (enrollment === null || session.userId !== enrollment.userId)
  ) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const studentName =
    enrollment?.user.name ?? certificate.holderName ?? '—';
  const studentDni =
    enrollment?.user.dni ?? certificate.holderDni ?? null;
  const studentCompany =
    enrollment?.user.company ?? certificate.holderCompany ?? null;
  const courseTitle =
    enrollment?.course.title ?? certificate.course?.title ?? '—';
  const certificateTitle =
    certificate.certificateTitle ?? courseTitle;
  const description =
    certificate.customDescription
    ?? enrollment?.course.certificateDescription
    ?? certificate.course?.certificateDescription
    ?? null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rivisig.com';
  const verificationUrl = `${baseUrl}/verificar/${certificate.verificationCode}`;

  const readImageAsBase64 = (filename: string) => {
    const filePath = path.join(process.cwd(), 'public', 'images', filename);
    const buffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  };

  const [qrCodeBase64, logoBase64, selloBase64, iconBase64] = await Promise.all([
    QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    }),
    Promise.resolve(readImageAsBase64('logo.png')),
    Promise.resolve(readImageAsBase64('sello.png')),
    Promise.resolve(readImageAsBase64('icon.png')),
  ]);

  const pdfElement = createElement(CertificatePDF, {
      studentName,
      studentDni,
      studentCompany,
      courseTitle: certificateTitle,
      introText: enrollment ? 'POR HABER COMPLETADO EXITOSAMENTE EL CURSO' : 'POR SU PARTICIPACIÓN EN',
      description,
      issueDate: certificate.issueDate,
      verificationCode: certificate.verificationCode,
      verificationUrl,
      expiresAt: certificate.expiresAt,
      logoBase64,
      selloBase64,
      qrCodeBase64,
      iconBase64,
    }) as ReactElement<DocumentProps>;

  const pdfBuffer = await renderToBuffer(pdfElement);

  const filename = `certificado-${certificate.verificationCode}.pdf`;

  return new NextResponse(Buffer.from(pdfBuffer) as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
