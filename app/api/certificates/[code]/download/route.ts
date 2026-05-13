import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CertificatePDF } from '@/lib/certificate-pdf';
import { getCertificateEffectiveStatus } from '@/lib/utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const session = await getSession();

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: {
      enrollment: {
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
          examAttempts: {
            where: { passed: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
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

  if (
    session &&
    session.role !== 'ADMIN' &&
    session.userId !== certificate.enrollment.userId
  ) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const score = certificate.enrollment.examAttempts[0]?.score ?? 100;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rivisig.com';
  const verificationUrl = `${baseUrl}/verificar/${certificate.verificationCode}`;

  const readImageAsBase64 = (filename: string) => {
    const filePath = path.join(process.cwd(), 'public', 'images', filename);
    const buffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  };

  const [qrCodeBase64, logoBase64, selloBase64] = await Promise.all([
    QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    }),
    Promise.resolve(readImageAsBase64('logo.png')),
    Promise.resolve(readImageAsBase64('sello.png')),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    createElement(CertificatePDF as any, {
      studentName: certificate.enrollment.user.name,
      courseTitle: certificate.enrollment.course.title,
      issueDate: certificate.issueDate,
      verificationCode: certificate.verificationCode,
      verificationUrl,
      score,
      expiresAt: certificate.expiresAt,
      logoBase64,
      selloBase64,
      qrCodeBase64,
    }) as any,
  );

  const filename = `certificado-${certificate.verificationCode}.pdf`;

  return new NextResponse(Buffer.from(pdfBuffer) as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
