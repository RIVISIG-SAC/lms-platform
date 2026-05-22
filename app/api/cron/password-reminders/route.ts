import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyPasswordExpiring } from "@/lib/notifications";

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

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      passwordExpiresAt: { gte: in6days, lt: in7days },
    },
    select: { id: true, name: true, email: true },
  });

  let remindersSent = 0;
  for (const u of users) {
    await notifyPasswordExpiring({
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      daysLeft: 7,
    });
    remindersSent++;
  }

  return NextResponse.json({
    ok: true,
    remindersSent,
    timestamp: now.toISOString(),
  });
}
