import { APP_TIME_ZONE, startOfDay, toDayKey } from "@/lib/timezone";

export const PERIOD_KEYS = ["today", "7d", "30d", "month"] as const;
export type PeriodKey = (typeof PERIOD_KEYS)[number];

export const PERIOD_OPTIONS: { key: PeriodKey; label: string; srLabel: string }[] = [
  { key: "today", label: "Hoy", srLabel: "Ver datos de hoy" },
  { key: "7d", label: "7 días", srLabel: "Ver datos de los últimos 7 días" },
  { key: "30d", label: "30 días", srLabel: "Ver datos de los últimos 30 días" },
  { key: "month", label: "Mes actual", srLabel: "Ver datos del mes actual" },
];

export type DateRange = { start: Date; end: Date };

/**
 * Rango del periodo y su equivalente inmediatamente anterior, para poder
 * comparar. El anterior dura exactamente lo mismo y termina justo cuando
 * empieza el actual, así la comparación no solapa días.
 */
export function getPeriodRanges(period: PeriodKey, now: Date = new Date()): {
  current: DateRange;
  previous: DateRange;
  days: number;
} {
  const today = startOfDay(now);
  let start: Date;

  switch (period) {
    case "today":
      start = today;
      break;
    case "7d":
      start = new Date(today.getTime() - 6 * 86_400_000);
      break;
    case "30d":
      start = new Date(today.getTime() - 29 * 86_400_000);
      break;
    case "month": {
      const [year, month] = toDayKey(now).split("-").map(Number);
      start = startOfDay(new Date(Date.UTC(year, month - 1, 1, 12)));
      break;
    }
  }

  const spanMs = now.getTime() - start.getTime();
  const days = Math.max(1, Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1);

  return {
    current: { start, end: now },
    previous: {
      start: new Date(start.getTime() - spanMs),
      end: new Date(start.getTime() - 1),
    },
    days,
  };
}

export type SeriesPoint = {
  /** `YYYY-MM-DD` en la zona de la app. */
  key: string;
  value: number;
  /** Etiqueta corta para el eje ("lun", "12 mar"). */
  label: string;
  /** Texto completo para lectores de pantalla y la tabla de datos. */
  fullLabel: string;
};

const weekdayFormatter = new Intl.DateTimeFormat("es-PE", {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
});
const shortDateFormatter = new Intl.DateTimeFormat("es-PE", {
  timeZone: APP_TIME_ZONE,
  day: "2-digit",
  month: "short",
});
const longDateFormatter = new Intl.DateTimeFormat("es-PE", {
  timeZone: APP_TIME_ZONE,
  weekday: "long",
  day: "2-digit",
  month: "long",
});

/**
 * Reparte fechas en un punto por día del rango.
 *
 * Los tramos se generan desde el `start` real del periodo, no desde "hoy menos
 * N": con "Mes actual" contando los días del mes, lo segundo se comía días del
 * mes anterior. Y el bucket se calcula en la zona de la app, no en UTC, para
 * que una inscripción de la noche no salte al día siguiente.
 */
export function buildDailySeries(
  dates: Date[],
  range: DateRange,
): SeriesPoint[] {
  const buckets = new Map<string, number>();
  const firstDay = startOfDay(range.start);
  const lastDay = startOfDay(range.end);

  for (
    let cursor = firstDay;
    cursor.getTime() <= lastDay.getTime();
    cursor = new Date(cursor.getTime() + 86_400_000)
  ) {
    buckets.set(toDayKey(cursor), 0);
  }

  for (const date of dates) {
    const key = toDayKey(date);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const total = buckets.size;

  return Array.from(buckets.entries()).map(([key, value]) => {
    // Mediodía UTC evita que el desplazamiento de zona mueva el día al formatear.
    const date = new Date(`${key}T12:00:00Z`);
    return {
      key,
      value,
      label: total <= 8 ? weekdayFormatter.format(date).replace(".", "") : shortDateFormatter.format(date).replace(".", ""),
      fullLabel: longDateFormatter.format(date),
    };
  });
}

export type Delta = {
  /** Variación porcentual, redondeada. `null` si no hay base con la que comparar. */
  percent: number | null;
  direction: "up" | "down" | "flat";
  /** Texto listo para leer, p. ej. "+12% vs. periodo anterior". */
  label: string;
};

/**
 * Compara el valor del periodo con el del anterior.
 *
 * Partir de cero no da un porcentaje con sentido (todo incremento sería
 * infinito), así que en ese caso se describe en palabras.
 */
export function getDelta(current: number, previous: number): Delta {
  if (previous === 0) {
    if (current === 0) {
      return { percent: null, direction: "flat", label: "Sin datos en ninguno de los dos periodos" };
    }
    return { percent: null, direction: "up", label: "Sin registros en el periodo anterior" };
  }

  const percent = Math.round(((current - previous) / previous) * 100);
  const direction = percent > 0 ? "up" : percent < 0 ? "down" : "flat";
  const signo = percent > 0 ? "+" : "";

  return {
    percent,
    direction,
    label: `${signo}${percent}% vs. periodo anterior (${previous.toLocaleString("es-PE")})`,
  };
}

/** Soles con céntimos; a partir de mil se redondea para que la cifra quepa. */
export function formatSoles(amount: number): string {
  const decimals = amount < 1000 ? 2 : 0;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
