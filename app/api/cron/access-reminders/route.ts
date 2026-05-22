import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  notifyAccessExpired,
  notifyAccessExpiring,
} from "@/lib/notifications";

// Permite que Vercel ejecute este endpoint con su token de Cron Jobs
// (header `Authorization: Bearer <CRON_SECRET>`). En local se invoca con curl.
function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const authHeader = request.headers.get("authorization") ?? "";
  return authHeader === `Bearer ${expected}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const in6days = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let remindersSent = 0;
  let expiredMarked = 0;

  // 1) Acceso por vencer en ~7 días (ventana hoy+6d → hoy+7d)
  const expiringSoon = await prisma.enrollment.findMany({
    where: {
      status: { in: ["PAID", "COMPLETED"] },
      endDate: { gte: in6days, lt: in7days },
    },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      course: { select: { id: true, title: true } },
    },
  });

  for (const e of expiringSoon) {
    if (!e.user.isActive) continue;
    await notifyAccessExpiring({
      userId: e.user.id,
      userName: e.user.name,
      userEmail: e.user.email,
      courseId: e.course.id,
      courseTitle: e.course.title,
      daysLeft: 7,
    });
    remindersSent++;
  }

  // 2) Acceso ya vencido → marcar EXPIRED + notificar
  const overdue = await prisma.enrollment.findMany({
    where: {
      status: { in: ["PAID", "COMPLETED"] },
      endDate: { lt: now },
    },
    include: {
      user: { select: { id: true, name: true, isActive: true } },
      course: { select: { id: true, title: true } },
    },
  });

  for (const e of overdue) {
    await prisma.enrollment.update({
      where: { id: e.id },
      data: { status: "EXPIRED" },
    });
    expiredMarked++;

    if (e.user.isActive) {
      await notifyAccessExpired({
        userId: e.user.id,
        courseId: e.course.id,
        courseTitle: e.course.title,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    remindersSent,
    expiredMarked,
    timestamp: now.toISOString(),
  });
}
