export default function AdminStudentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-1">
        Estudiantes
      </h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-6">
        Listado de estudiantes registrados
      </p>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
        <p className="text-[var(--muted-foreground)]">
          No hay estudiantes registrados todavía.
        </p>
      </div>
    </div>
  );
}
