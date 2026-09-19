-- El titular de un certificado pasa a guardarse en el propio certificado al
-- emitirlo, en vez de leerse del perfil en cada descarga. Esta copia congela
-- los certificados ya emitidos con el nombre que tienen hoy: a partir de aquí,
-- editar el perfil deja de reescribir un certificado existente.
--
-- Solo afecta a los certificados nacidos de una inscripción; los manuales ya
-- guardaban sus propios datos de titular.
UPDATE "Certificate" AS c
SET
  "holderName"    = u."name",
  "holderDni"     = COALESCE(c."holderDni", u."dni"),
  "holderCompany" = COALESCE(c."holderCompany", u."company")
FROM "Enrollment" AS e
JOIN "User" AS u ON u."id" = e."userId"
WHERE c."enrollmentId" = e."id"
  AND c."holderName" IS NULL;
