-- Video de presentación del curso (opcional). Antes la ficha pública reutilizaba
-- el video del primer capítulo, que no es material de venta.
ALTER TABLE "Course" ADD COLUMN "previewVimeoId" TEXT;
