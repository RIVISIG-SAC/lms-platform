import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseCloudinaryUrl, signedDownloadUrl } from "@/lib/cloudinary";
import { checkRateLimit } from "@/lib/security/rateLimit";

type Params = { params: Promise<{ resourceId: string }> };

/** Deja el nombre visible del recurso en algo seguro para una cabecera HTTP. */
function toFilename(name: string, format: string) {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w .-]+/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100) || "recurso";

  return format && !base.toLowerCase().endsWith(`.${format.toLowerCase()}`)
    ? `${base}.${format}`
    : base;
}

/**
 * Descarga de un recurso de clase.
 *
 * Hace de proxy en vez de enlazar directo a `res.cloudinary.com` por dos
 * motivos:
 *
 * 1. Cloudinary bloquea la entrega pública de PDF por defecto ("restricted
 *    media types"), así que la URL pública devuelve 401 aunque el archivo esté
 *    subido. Aquí pedimos el original con una URL firmada de la API de
 *    descarga, que sí está autorizada.
 * 2. El enlace de Cloudinary es público: cualquiera con la URL se llevaba el
 *    material. Ahora exigimos sesión y matrícula en el curso.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { resourceId } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = checkRateLimit(session.userId, "resource:download");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiadas descargas. Reintenta en ${rl.retryInSeconds}s.` },
      { status: 429 },
    );
  }

  const resource = await prisma.chapterResource.findUnique({
    where: { id: resourceId },
    select: {
      name: true,
      url: true,
      chapter: {
        select: {
          module: {
            select: {
              course: {
                select: { id: true, instructor: { select: { userId: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!resource) {
    return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
  }

  const course = resource.chapter.module.course;

  const allowed =
    session.role === "ADMIN" ||
    (session.role === "INSTRUCTOR" && course.instructor?.userId === session.userId) ||
    (await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId: course.id } },
      select: { id: true },
    })) !== null;

  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const asset = parseCloudinaryUrl(resource.url);

  // Recurso enlazado a mano fuera de Cloudinary: no hay nada que firmar.
  if (!asset) {
    return NextResponse.redirect(resource.url);
  }

  const upstream = await fetch(signedDownloadUrl(asset));

  if (!upstream.ok || !upstream.body) {
    console.error(
      `[resources] Cloudinary respondió ${upstream.status} para ${resource.url}`,
      upstream.headers.get("x-cld-error") ?? "",
    );
    return NextResponse.json(
      { error: "No se pudo obtener el archivo" },
      { status: 502 },
    );
  }

  const filename = toFilename(resource.name, asset.format);
  const length = upstream.headers.get("content-length");

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      ...(length ? { "Content-Length": length } : {}),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
