import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  sendCertificateIssuedEmail,
  sendAccessExpiringEmail,
  sendPasswordExpiringEmail,
} from "@/lib/email";

type CreateInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

export async function createNotification(input: CreateInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
      },
    });
  } catch (err) {
    console.error("[notifications] createNotification failed:", err);
  }
}

export async function notifyAdmins(input: Omit<CreateInput, "userId">) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
    });
    if (admins.length === 0) return;
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
      })),
    });
  } catch (err) {
    console.error("[notifications] notifyAdmins failed:", err);
  }
}

async function hasRecent(userId: string, type: NotificationType, hours: number) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const found = await prisma.notification.findFirst({
    where: { userId, type, createdAt: { gte: since } },
    select: { id: true },
  });
  return Boolean(found);
}

// ─── Helpers de eventos ─────────────────────────────────────────────────────

export async function notifyEnrollmentConfirmed(params: {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  notifyAdminsAlso?: boolean;
}) {
  await createNotification({
    userId: params.userId,
    type: "ENROLLMENT_CONFIRMED",
    title: "Inscripción confirmada",
    message: `Te has inscrito en ${params.courseTitle}. Tienes 180 días para completarlo.`,
    link: `/student/courses/${params.courseId}`,
  });

  if (params.notifyAdminsAlso) {
    await notifyAdmins({
      type: "ADMIN_NEW_ENROLLMENT",
      title: "Nueva inscripción",
      message: `${params.userName} se inscribió en ${params.courseTitle}.`,
      link: `/admin/courses/${params.courseId}`,
    });
  }
}

export async function notifyPaymentReceived(params: {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  kind: "course" | "certificate";
  resourceTitle: string;
  resourceLink: string;
  notifyAdminsAlso?: boolean;
}) {
  const isCourse = params.kind === "course";
  const title = isCourse ? "Pago de curso recibido" : "Pago de certificado recibido";
  const message = isCourse
    ? `Confirmamos el pago de tu inscripción en ${params.resourceTitle}. Ya tienes acceso al curso.`
    : `Confirmamos el pago de tu certificado de ${params.resourceTitle}.`;

  await createNotification({
    userId: params.userId,
    type: "PAYMENT_RECEIVED",
    title,
    message,
    link: params.resourceLink,
  });

  if (params.notifyAdminsAlso) {
    await notifyAdmins({
      type: "ADMIN_NEW_PAYMENT",
      title: isCourse ? "Nuevo pago de curso" : "Nuevo pago de certificado",
      message: `${params.userName} pagó ${formatPEN(params.amount)} por ${params.resourceTitle}.`,
      link: isCourse ? "/admin/students" : "/admin/certificates",
    });
  }
}

export async function notifyCertificateIssued(params: {
  userId: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  verificationCode: string;
  notifyAdminsAlso?: boolean;
}) {
  const link = "/student/certificates";

  await createNotification({
    userId: params.userId,
    type: "CERTIFICATE_ISSUED",
    title: "Certificado emitido",
    message: `Tu certificado del curso ${params.courseTitle} ya está disponible.`,
    link,
  });

  try {
    await sendCertificateIssuedEmail(
      params.userEmail,
      params.userName,
      params.courseTitle,
      params.verificationCode,
    );
  } catch (err) {
    console.error("[notifications] sendCertificateIssuedEmail failed:", err);
  }

  if (params.notifyAdminsAlso) {
    await notifyAdmins({
      type: "ADMIN_CERTIFICATE_ISSUED",
      title: "Certificado emitido",
      message: `Se emitió el certificado de ${params.userName} para ${params.courseTitle}.`,
      link: "/admin/certificates",
    });
  }
}

export async function notifyAccessExpiring(params: {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  daysLeft: number;
}) {
  // Idempotencia: no repetir el mismo aviso en menos de 24 h
  if (await hasRecent(params.userId, "ACCESS_EXPIRING", 24)) return;

  await createNotification({
    userId: params.userId,
    type: "ACCESS_EXPIRING",
    title: "Tu acceso al curso está por vencer",
    message: `Te quedan ${params.daysLeft} día(s) de acceso a ${params.courseTitle}.`,
    link: `/student/courses/${params.courseId}`,
  });

  try {
    await sendAccessExpiringEmail(
      params.userEmail,
      params.userName,
      params.courseTitle,
      params.daysLeft,
    );
  } catch (err) {
    console.error("[notifications] sendAccessExpiringEmail failed:", err);
  }
}

export async function notifyAccessExpired(params: {
  userId: string;
  courseId: string;
  courseTitle: string;
}) {
  if (await hasRecent(params.userId, "ACCESS_EXPIRED", 24)) return;

  await createNotification({
    userId: params.userId,
    type: "ACCESS_EXPIRED",
    title: "Tu acceso al curso ha expirado",
    message: `Tu período de 180 días en ${params.courseTitle} ha finalizado.`,
    link: `/student/courses/${params.courseId}`,
  });
}

export async function notifyPasswordExpiring(params: {
  userId: string;
  userName: string;
  userEmail: string;
  daysLeft: number;
}) {
  if (await hasRecent(params.userId, "PASSWORD_EXPIRING", 24)) return;

  await createNotification({
    userId: params.userId,
    type: "PASSWORD_EXPIRING",
    title: "Tu contraseña está por vencer",
    message: `Por seguridad, cambia tu contraseña en los próximos ${params.daysLeft} día(s).`,
    link: "/student/profile",
  });

  try {
    await sendPasswordExpiringEmail(params.userEmail, params.userName, params.daysLeft);
  } catch (err) {
    console.error("[notifications] sendPasswordExpiringEmail failed:", err);
  }
}

function formatPEN(amount: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}
