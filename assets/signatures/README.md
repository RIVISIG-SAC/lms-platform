# Firmas de los representantes

Estos PNG se embeben en el PDF del certificado y **no se sirven por HTTP**:
viven fuera de `public/`, así que no existe una URL pública que apunte a ellos.
Next los incluye en el bundle de la ruta de descarga vía
`outputFileTracingIncludes` (ver `next.config.ts`).

## Requisitos

- Formato **PNG con fondo transparente** (react-pdf no soporta webp).
- Recorte ajustado al trazo (sin márgenes transparentes sobrantes): se encajan
  por **altura** con `objectFit: contain`, así que un margen extra encoge la/
  firma visible.
- Lado mayor recomendado: **~500 px**. Se renderizan a 40 pt de alto, así que
  más resolución solo engorda el PDF y facilita extraer una copia reutilizable.
- El nombre del archivo debe coincidir con el campo `file` de `SIGNATORIES`
  en `lib/certificate-pdf.tsx`.

## Archivos esperados

- `lewis-rivera.png`
- `rosa-soria.png`
- `alex-rivera.png`

Si un archivo falta, el certificado no se rompe: cae al texto manuscrito
(Great Vibes) que se usaba antes.
