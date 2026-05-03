import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { CulqiCheckout } from "@/components/student/CulqiCheckout";
import { formatCurrency } from "@/lib/utils";
import { enrollFree } from "@/app/actions/enrollments";

type Props = { params: Promise<{ courseId: string }> };

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  return { title: course ? `${course.title} | Cursos Pro` : "Curso" };
}

export default async function CourseCatalogDetailPage({ params }: Props) {
  const { courseId } = await params;
  const session = await getRequiredSession();

  const [course, enrollment] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId, published: true },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: { chapters: { orderBy: { order: "asc" }, select: { id: true, title: true, vimeoVideoId: true } } },
        },
      },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
    }),
  ]);

  if (!course) notFound();

  // Si ya está inscrito y activo, ir directamente al curso
  if (enrollment?.status === "PAID" || enrollment?.status === "COMPLETED") {
    redirect(`/student/courses/${courseId}`);
  }

  const totalChapters = course.modules.reduce((acc: number, m) => acc + m.chapters.length, 0);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-6">
        <Link href="/student/catalog" className="hover:text-[var(--primary)]">
          Catálogo
        </Link>
        <span>›</span>
        <span className="truncate max-w-xs">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <div className="aspect-video bg-linear-to-br from-primary to-primary/80 rounded-xl overflow-hidden">
            {course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl opacity-20">📚</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-3">
              {course.title}
            </h1>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 py-4 border-y border-[var(--border)]">
            {[
              { label: "Módulos", value: course.modules.length },
              { label: "Capítulos", value: totalChapters },
              { label: "Acceso", value: "180 días" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-semibold text-[var(--foreground)]">{s.value}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Curriculum */}
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">
              Contenido del curso
            </h2>
            <div className="space-y-2">
              {course.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="border border-[var(--border)] rounded-lg overflow-hidden"
                >
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {mod.order + 1}. {mod.title}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {mod.chapters.length} capítulos
                    </span>
                  </div>
                  <ul className="divide-y divide-[var(--border)]">
                    {mod.chapters.map((ch) => (
                      <li
                        key={ch.id}
                        className="px-4 py-2.5 flex items-center gap-2 text-sm text-[var(--muted-foreground)]"
                      >
                        <span className="text-xs">{ch.vimeoVideoId ? "▶" : "📄"}</span>
                        {ch.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — Compra / Inscripción */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 sticky top-6 space-y-5">
            <div className="text-center">
              {course.isFree ? (
                <>
                  <p className="text-3xl font-bold text-green-600">Gratis</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Acceso 180 días · Certificado por S/. {Number(course.certificateFee).toFixed(2)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-[var(--foreground)]">
                    {formatCurrency(course.price)}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Pago único · Acceso 180 días
                  </p>
                </>
              )}
            </div>

            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              {[
                `${totalChapters} clases en video`,
                "Evaluación final incluida",
                course.isFree
                  ? `Certificado al aprobar (S/. ${Number(course.certificateFee).toFixed(2)})`
                  : "Certificado verificable al aprobar",
                "Acceso desde cualquier dispositivo",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-green-600 font-bold text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {course.isFree ? (
              <form action={enrollFree.bind(null, course.id)}>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity text-base"
                >
                  Inscribirse gratis
                </button>
              </form>
            ) : (
              <CulqiCheckout
                courseId={course.id}
                courseTitle={course.title}
                priceInSoles={Number(course.price)}
              />
            )}

            {enrollment?.status === "FAILED" && (
              <p className="text-xs text-center text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                Tu intento anterior no fue aprobado. Puedes volver a inscribirte.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
