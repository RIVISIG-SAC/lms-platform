import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { BuyButton } from "@/components/landing/BuyButton";
import { Award, ClipboardList, Lock, BarChart3, PlayCircle, BookOpen } from "lucide-react";

export async function generateMetadata(props: { params: Promise<unknown> }) {
  const { courseId } = (await props.params) as { courseId: string };
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return {};
  return { title: `${course.title} — RIVISIG Consultores`, description: course.description };
}

export default async function CourseDetailPage(props: { params: Promise<unknown> }) {
  const { courseId } = (await props.params) as { courseId: string };

  const [course, session] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId, published: true },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            chapters: { orderBy: { order: "asc" }, select: { id: true, title: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    }),
    getSession(),
  ]);

  if (!course) notFound();

  const chapterCount = course.modules.reduce((acc, m) => acc + m.chapters.length, 0);

  const enrollment = session
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.userId, courseId } },
        select: { status: true },
      })
    : null;

  const isPaid = enrollment?.status === "PAID" || enrollment?.status === "COMPLETED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Badge variant="outline" className="mb-3 text-primary border-primary/30 bg-primary/5">
              Certificado al aprobar
            </Badge>
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {course.title}
            </h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary font-semibold">{course.modules.length}</span> módulos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary font-semibold">{chapterCount}</span> clases
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary font-semibold">180 días</span> de acceso
            </div>
          </div>

          <Separator />

          {/* Curriculum */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Contenido del curso</h2>
            <div className="space-y-3">
              {course.modules.map((mod) => (
                <div key={mod.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{mod.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {mod.chapters.length} clase{mod.chapters.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {mod.chapters.map((ch) => (
                      <li key={ch.id} className="px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                        <PlayCircle className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                        {ch.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* What you'll get */}
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Award, text: "Certificado con código de verificación único" },
              { icon: ClipboardList, text: "Contenido alineado a normas ISO y estándares internacionales" },
              { icon: Lock, text: "Máximo 2 intentos para mantener la seriedad del proceso" },
              { icon: BarChart3, text: "Progreso guardado automáticamente" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Purchase card ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-border rounded-2xl overflow-hidden shadow-sm bg-white">
            {course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                <BookOpen className="h-14 w-14 text-white/20" />
              </div>
            )}

            <div className="p-6 space-y-4">
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(course.price)}
              </p>
              <p className="text-xs text-muted-foreground">Acceso por 180 días · Certificado incluido</p>

              {isPaid ? (
                <Link
                  href={`/student/courses/${courseId}`}
                  className={cn(buttonVariants(), "w-full h-11 justify-center")}
                >
                  Ir al curso →
                </Link>
              ) : session ? (
                <BuyButton courseId={courseId} price={course.price} />
              ) : (
                <Link
                  href={`/registro?next=/cursos/${courseId}`}
                  className={cn(buttonVariants(), "w-full h-11 justify-center")}
                >
                  Comprar ahora
                </Link>
              )}

              {!session && (
                <p className="text-xs text-center text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href={`/login?next=/cursos/${courseId}`}
                    className="text-primary hover:underline"
                  >
                    Inicia sesión
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
