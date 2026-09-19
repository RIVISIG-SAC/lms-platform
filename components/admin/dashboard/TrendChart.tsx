import { cn } from "@/lib/utils";
import type { SeriesPoint } from "@/lib/admin-dashboard";

type Props = {
  title: string;
  description: string;
  points: SeriesPoint[];
  /** Nombre de lo que se cuenta, para las etiquetas ("inscripciones"). */
  unit: string;
};

/**
 * Gráfico de barras accesible.
 *
 * Las barras son decoración (`aria-hidden`): los datos reales viajan en una
 * tabla oculta visualmente pero disponible para lectores de pantalla. La
 * versión anterior dejaba el valor solo en un tooltip de `:hover`, así que era
 * inalcanzable con teclado, con lector de pantalla y en móvil.
 */
export function TrendChart({ title, description, points, unit }: Props) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const total = points.reduce((acc, p) => acc + p.value, 0);
  const pico = points.reduce((a, b) => (b.value > a.value ? b : a), points[0]);

  // Con muchos días no caben todas las etiquetas: se rotulan algunas y el
  // resto queda cubierto por la tabla de datos.
  const cadaCuantas = points.length > 15 ? Math.ceil(points.length / 8) : 1;

  return (
    <section
      aria-labelledby="trend-chart-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <h2 id="trend-chart-title" className="text-base font-bold text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      {total === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No hubo {unit} en este periodo.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-bold text-foreground tabular-nums">{total}</span>{" "}
            {unit} en total · pico de{" "}
            <span className="font-bold text-foreground tabular-nums">{pico.value}</span>{" "}
            el {pico.fullLabel}
          </p>

          <div
            className="mt-5 flex h-48 items-end justify-between gap-1 sm:gap-1.5"
            aria-hidden="true"
          >
            {points.map((point, i) => (
              <div key={point.key} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5">
                <span
                  className={cn(
                    "text-center text-[11px] font-bold tabular-nums",
                    point.value > 0 ? "text-foreground" : "text-muted-foreground/40",
                  )}
                >
                  {point.value}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-md",
                    point.value > 0 ? "bg-primary" : "bg-muted",
                  )}
                  style={{
                    // Las barras sin datos conservan una línea mínima para que
                    // se lea el eje; con 0 el día desaparecería del gráfico.
                    height: point.value > 0 ? `${(point.value / max) * 100}%` : "3px",
                  }}
                />
                <span className="truncate text-center text-[11px] font-medium text-muted-foreground">
                  {i % cadaCuantas === 0 ? point.label : " "}
                </span>
              </div>
            ))}
          </div>

          <table className="sr-only">
            <caption>
              {title}: {unit} por día.
            </caption>
            <thead>
              <tr>
                <th scope="col">Día</th>
                <th scope="col">{unit}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.key}>
                  <th scope="row">{point.fullLabel}</th>
                  <td>{point.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
