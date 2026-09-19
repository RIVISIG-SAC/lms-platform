/**
 * Presentación de las notificaciones, compartida por la bandeja
 * (`/notifications`) y la campana del header para que ambas muestren los
 * mismos iconos, etiquetas y agrupaciones.
 */
import {
  Award,
  Clock,
  CreditCard,
  GraduationCap,
  KeyRound,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@prisma/client";
import { APP_TIME_ZONE } from "@/lib/timezone";

/**
 * La bandeja se renderiza en el servidor y se hidrata en el navegador: si cada
 * lado resolviera "hoy" con su propia zona, una notificación de madrugada
 * caería en grupos distintos y React marcaría error de hidratación.
 */
const TIME_ZONE = APP_TIME_ZONE;

/** Orden en que se ofrecen los tipos en el filtro de la bandeja. */
export const NOTIFICATION_TYPES = [
  "ENROLLMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "CERTIFICATE_ISSUED",
  "ACCESS_EXPIRING",
  "ACCESS_EXPIRED",
  "PASSWORD_EXPIRING",
  "ADMIN_NEW_ENROLLMENT",
  "ADMIN_NEW_PAYMENT",
  "ADMIN_CERTIFICATE_ISSUED",
  "ADMIN_NEW_SUPPORT_MESSAGE",
] as const satisfies readonly NotificationType[];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  ENROLLMENT_CONFIRMED: "Inscripciones",
  PAYMENT_RECEIVED: "Pagos",
  CERTIFICATE_ISSUED: "Certificados",
  ACCESS_EXPIRING: "Acceso por vencer",
  ACCESS_EXPIRED: "Acceso vencido",
  PASSWORD_EXPIRING: "Contraseña por vencer",
  ADMIN_NEW_ENROLLMENT: "Admin · Inscripciones",
  ADMIN_NEW_PAYMENT: "Admin · Pagos",
  ADMIN_CERTIFICATE_ISSUED: "Admin · Certificados",
  ADMIN_NEW_SUPPORT_MESSAGE: "Admin · Soporte",
};

/** El mapa se exporta tal cual: resolverlo con una función haría que el
 *  compilador de React tratara el icono como un componente creado en render. */
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  ENROLLMENT_CONFIRMED: GraduationCap,
  PAYMENT_RECEIVED: CreditCard,
  CERTIFICATE_ISSUED: Award,
  ACCESS_EXPIRING: Clock,
  ACCESS_EXPIRED: Clock,
  PASSWORD_EXPIRING: KeyRound,
  ADMIN_NEW_ENROLLMENT: GraduationCap,
  ADMIN_NEW_PAYMENT: CreditCard,
  ADMIN_CERTIFICATE_ISSUED: Award,
  ADMIN_NEW_SUPPORT_MESSAGE: LifeBuoy,
};

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const longFormatter = new Intl.DateTimeFormat("es-PE", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Día calendario (en la zona fija) expresado como número de días. */
function toDayNumber(date: Date): number {
  const [year, month, day] = dayFormatter.format(date).split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function formatNotificationDate(date: Date | string): string {
  return longFormatter.format(new Date(date));
}

export function formatNotificationTimeAgo(date: Date | string): string {
  const value = new Date(date);
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000);
  if (seconds < 60) return "hace instantes";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return value.toLocaleDateString("es-PE", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
  });
}

const GROUP_LABELS = {
  today: "Hoy",
  yesterday: "Ayer",
  week: "Esta semana",
  older: "Anteriores",
} as const;

export type NotificationGroupKey = keyof typeof GROUP_LABELS;

export type NotificationGroup<T> = {
  key: NotificationGroupKey;
  label: string;
  items: T[];
};

/**
 * Reparte notificaciones ya ordenadas de más nueva a más antigua en tramos de
 * fecha, conservando el orden y descartando los tramos vacíos.
 */
export function groupNotificationsByDate<T extends { createdAt: Date | string }>(
  items: T[],
  now: Date = new Date(),
): NotificationGroup<T>[] {
  const today = toDayNumber(now);
  const buckets: Record<NotificationGroupKey, T[]> = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  };

  for (const item of items) {
    const diff = today - toDayNumber(new Date(item.createdAt));
    if (diff <= 0) buckets.today.push(item);
    else if (diff === 1) buckets.yesterday.push(item);
    else if (diff < 7) buckets.week.push(item);
    else buckets.older.push(item);
  }

  return (Object.keys(GROUP_LABELS) as NotificationGroupKey[])
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({ key, label: GROUP_LABELS[key], items: buckets[key] }));
}
