import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CertificatePDF, SIGNATORIES } from '@/lib/certificate-pdf';
import { resolveVerificationCode } from '@/lib/certificate-code';
import { getCertificateEffectiveStatus } from '@/lib/utils';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { getClientIp } from '@/lib/security/ip';

// Los assets de marca son inmutables: se leen del disco una sola vez por
// instancia en vez de en cada descarga. react-pdf no soporta webp, así que
// estas rutas deben seguir apuntando a los PNG.
let brandAssets: [logo: string, sello: string, icon: string] | null = null;

function getBrandAssets() {
  if (!brandAssets) {
    const readImageAsBase64 = (filename: string) => {
      const filePath = path.join(process.cwd(), 'public', 'images', filename);
      const buffer = fs.readFileSync(filePath);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    };

    brandAssets = [
      readImageAsBase64('logo.png'),
      readImageAsBase64('sello-transparent.png'),
      readImageAsBase64('icon.png'),
    ];
  }

  return brandAssets;
}

// Las firmas viven fuera de `public/` a proposito: no hay URL que las sirva,
// solo viajan embebidas dentro del PDF. Mismo cache por instancia que la marca.
let signatureAssets: Record<string, string> | null = null;

function getSignatureAssets() {
  if (!signatureAssets) {
    const assets: Record<string, string> = {};

    for (const sig of SIGNATORIES) {
      const filePath = path.join(process.cwd(), 'assets', 'signatures', sig.file);

      // Una firma que falta no debe tumbar la descarga: el PDF cae al texto
      // manuscrito de respaldo.
      if (!fs.existsSync(filePath)) continue;

      const buffer = fs.readFileSync(filePath);
      assets[sig.file] = `data:image/png;base64,${buffer.toString('base64')}`;
    }

    signatureAssets = assets;
  }

  return signatureAssets;
}

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

  // Tolera el código escrito sin guiones o en minúsculas.
  const verificationCode = await resolveVerificationCode(
    decodeURIComponent(code).trim(),
  );

  const certificate = verificationCode
    ? await prisma.certificate.findUnique({
        where: { verificationCode },
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
      })
    : null;

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

  const [logoBase64, selloBase64, iconBase64] = getBrandAssets();
  const signatureBase64 = getSignatureAssets();

  const qrCodeBase64 = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 200,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });

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
      signatureBase64,
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
