/**
 * Zona horaria de referencia de la plataforma.
 *
 * Todo lo que agrupe por "día" debe usarla explícitamente. El servidor corre en
 * UTC y el navegador en la zona del visitante: sin fijarla, una inscripción de
 * las 9 de la noche cae en un día distinto según quién mire, y lo que se
 * renderiza en servidor no coincide con lo que hidrata el cliente.
 */
export const APP_TIME_ZONE = "America/Lima";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Día calendario en la zona de la app, como `YYYY-MM-DD`. */
export function toDayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

/** Desplazamiento de la zona respecto a UTC, en minutos, para una fecha dada. */
function offsetMinutes(date: Date): number {
  // `en-CA` con `longOffset` devuelve algo como "GMT-05:00"; Perú no aplica
  // horario de verano, pero se calcula por fecha igualmente para no depender
  // de que eso siga siendo cierto.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    timeZoneName: "longOffset",
  }).formatToParts(date);

  const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(raw);
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/** Instante en que empieza el día (00:00 en la zona de la app) de `date`. */
export function startOfDay(date: Date): Date {
  const [year, month, day] = toDayKey(date).split("-").map(Number);
  const asUtc = Date.UTC(year, month - 1, day);
  return new Date(asUtc - offsetMinutes(date) * 60_000);
}

/** Suma (o resta, con negativos) días calendario conservando la hora local. */
export function addCalendarDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
