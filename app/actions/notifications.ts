"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

export async function getUnreadCount(): Promise<number> {
  const session = await getRequiredSession();
  return prisma.notification.count({
    where: { userId: session.userId, read: false },
  });
}

export async function getRecentNotifications(limit = 10) {
  const session = await getRequiredSession();
  return prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listNotifications(params: {
  cursor?: string;
  onlyUnread?: boolean;
  pageSize?: number;
}) {
  const session = await getRequiredSession();
  const pageSize = params.pageSize ?? 50;

  const items = await prisma.notification.findMany({
    where: {
      userId: session.userId,
      ...(params.onlyUnread ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: pageSize + 1,
    ...(params.cursor
      ? { cursor: { id: params.cursor }, skip: 1 }
      : {}),
  });

  const hasMore = items.length > pageSize;
  const trimmed = hasMore ? items.slice(0, pageSize) : items;
  const nextCursor = hasMore ? trimmed[trimmed.length - 1]?.id ?? null : null;

  return { items: trimmed, nextCursor };
}

export async function markAsRead(notificationId: string) {
  const session = await getRequiredSession();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.userId, read: false },
    data: { read: true, readAt: new Date() },
  });

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await getRequiredSession();

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true, readAt: new Date() },
  });

  revalidatePath("/notifications");
  return { success: true };
}
