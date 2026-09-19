"use server";

import { revalidatePath } from "next/cache";
import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

const MAX_PAGE_SIZE = 50;

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
  status?: "unread" | "read";
  type?: string;
  pageSize?: number;
}) {
  const session = await getRequiredSession();
  const pageSize = Math.min(Math.max(1, params.pageSize ?? 20), MAX_PAGE_SIZE);
  // El tipo llega del cliente: si no es del enum se ignora el filtro en lugar
  // de dejar que Prisma reviente con una URL manipulada.
  const type = (Object.values(NotificationType) as string[]).includes(
    params.type ?? "",
  )
    ? (params.type as NotificationType)
    : undefined;

  const items = await prisma.notification.findMany({
    where: {
      userId: session.userId,
      ...(params.status ? { read: params.status === "read" } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: pageSize + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
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

export async function markAsUnread(notificationId: string) {
  const session = await getRequiredSession();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.userId, read: true },
    data: { read: false, readAt: null },
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

export async function deleteNotification(notificationId: string) {
  const session = await getRequiredSession();

  const { count } = await prisma.notification.deleteMany({
    where: { id: notificationId, userId: session.userId },
  });

  revalidatePath("/notifications");
  return { success: true, deleted: count };
}

export async function deleteReadNotifications() {
  const session = await getRequiredSession();

  const { count } = await prisma.notification.deleteMany({
    where: { userId: session.userId, read: true },
  });

  revalidatePath("/notifications");
  return { success: true, deleted: count };
}
