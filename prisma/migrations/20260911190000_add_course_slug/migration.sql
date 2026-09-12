-- Slug publico para los cursos: /cursos/<slug> en vez de /cursos/<cuid>.
-- Se rellena aqui mismo porque `pnpm build` corre `prisma migrate deploy`, asi
-- que la columna tiene que quedar NOT NULL dentro de la propia migracion.

ALTER TABLE "Course" ADD COLUMN "slug" TEXT;

-- Backfill desde el titulo: se quitan acentos, se pasa a minusculas y todo lo
-- que no sea alfanumerico se colapsa en guiones.
UPDATE "Course"
SET "slug" = trim(BOTH '-' FROM regexp_replace(
  lower(translate(
    "title",
    'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
    'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
  )),
  '[^a-z0-9]+', '-', 'g'
));

-- Titulos que no dejan ningun caracter utilizable (p. ej. solo simbolos).
UPDATE "Course"
SET "slug" = 'curso-' || lower("id")
WHERE "slug" IS NULL OR "slug" = '';

-- Desempate por titulos repetidos: el mas antiguo conserva el slug limpio.
WITH duplicados AS (
  SELECT "id", row_number() OVER (PARTITION BY "slug" ORDER BY "createdAt", "id") AS rn
  FROM "Course"
)
UPDATE "Course" c
SET "slug" = c."slug" || '-' || d.rn
FROM duplicados d
WHERE c."id" = d."id" AND d.rn > 1;

ALTER TABLE "Course" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
