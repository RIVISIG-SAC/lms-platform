import { Eyebrow } from "./SectionHeading";

type FichaField = { label: string; value: string | null | undefined; wide?: boolean };

/** Ficha del Proyecto: hoja de datos estructurada con estética de documento. */
export function ProjectFicha({
  fields,
  standards,
}: {
  fields: FichaField[];
  standards?: string[];
}) {
  const visible = fields.filter((f) => Boolean(f.value));
  if (visible.length === 0 && !standards?.length) return null;

  return (
    <div className="emp-corners relative border border-border bg-card p-7 sm:p-10">
      <Eyebrow>Ficha del proyecto</Eyebrow>

      <dl className="mt-8 grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
        {visible.map((field) => (
          <div key={field.label} className={`bg-card py-5 sm:px-6 ${field.wide ? "sm:col-span-2" : ""}`}>
            <dt className="font-semibold text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {field.label}
            </dt>
            <dd className="mt-2 text-[0.95rem] leading-relaxed text-foreground">{field.value}</dd>
          </div>
        ))}

        {standards && standards.length > 0 && (
          <div className="bg-card py-5 sm:col-span-2 sm:px-6">
            <dt className="font-semibold text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Normas certificadas
            </dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {standards.map((standard) => (
                <span
                  key={standard}
                  className="font-semibold border border-primary/25 bg-primary/5 px-2.5 py-1 text-[11px] tracking-wider text-primary"
                >
                  {standard}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
