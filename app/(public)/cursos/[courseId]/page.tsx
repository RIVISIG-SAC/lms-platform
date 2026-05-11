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
import { enrollFree } from "@/app/actions/enrollments";
import { Award, ClipboardList, Lock, BarChart3, PlayCircle, BookOpen, User, ArrowRight, ShieldCheck } from "lucide-react";
import { InstructorCard } from "@/components/instructor/InstructorCard";

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
        instructor: {
          include: { user: { select: { name: true } } },
        },
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
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-white via-muted/35 to-white">
        <div className="absolute -top-28 -right-20 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
            {course.isFree ? "Acceso gratuito · Certificado con costo" : "Certificado al aprobar"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight max-w-4xl">
            {course.title}
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl text-base">
            {course.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground">
              <span className="font-bold text-primary">{course.modules.length}</span> modulos
            </div>
            <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground">
              <span className="font-bold text-primary">{chapterCount}</span> clases
            </div>
            <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground">
              Acceso por 180 dias
            </div>
            <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Certificacion verificable
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Curriculum */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Contenido del curso</h2>
            <div className="space-y-3">
              {course.modules.map((mod) => (
                <div key={mod.id} className="border border-border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/25">
                  <div className="bg-muted/50 px-4 py-3.5 flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{mod.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {mod.chapters.length} clase{mod.chapters.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {mod.chapters.map((ch) => (
                      <li key={ch.id} className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                        <PlayCircle className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                        {ch.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          {course.instructor && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="size-5 text-primary" />
                  Instructor
                </h2>
                <InstructorCard
                  instructorId={course.instructor.id}
                  name={course.instructor.user.name}
                  title={course.instructor.title}
                  bio={course.instructor.bio}
                  avatarUrl={course.instructor.avatarUrl}
                  linkedin={course.instructor.linkedin}
                  website={course.instructor.website}
                />
              </div>
            </>
          )}

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
          <div className="sticky top-24 border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5 bg-white">
            {course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-linear-to-br from-primary/80 to-primary flex items-center justify-center">
                <BookOpen className="h-14 w-14 text-white/20" />
              </div>
            )}

            <div className="p-6 space-y-5">
              {course.isFree ? (
                <>
                  <p className="text-3xl font-bold text-green-600">Gratis</p>
                  <p className="text-xs text-muted-foreground">
                    Acceso por 180 días · Certificado S/. {Number(course.certificateFee).toFixed(2)} al aprobar
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(course.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">Acceso por 180 días · Certificado incluido</p>
                </>
              )}

              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Incluye</p>
                <ul className="space-y-1.5 text-sm text-foreground">
                  <li className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Ruta completa por modulos</li>
                  <li className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Evaluacion y certificado verificable</li>
                </ul>
              </div>

              {isPaid ? (
                <Link
                  href={`/student/courses/${courseId}`}
                  className={cn(buttonVariants(), "w-full h-11 justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2")}
                >
                  Ir al curso <ArrowRight className="size-4" />
                </Link>
              ) : course.isFree ? (
                session ? (
                  <form action={enrollFree.bind(null, courseId)}>
                    <button
                      type="submit"
                      className="w-full h-11 bg-green-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Inscribirse gratis
                    </button>
                  </form>
                ) : (
                  <Link
                    href={`/login?next=/cursos/${courseId}`}
                    className={cn(buttonVariants(), "w-full h-11 justify-center focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2")}
                  >
                    Iniciar sesión para inscribirse
                  </Link>
                )
              ) : session ? (
                <BuyButton courseId={courseId} price={course.price} />
              ) : (
                <Link
                  href={`/registro?next=/cursos/${courseId}`}
                  className={cn(buttonVariants(), "w-full h-11 justify-center focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2")}
                >
                  Comprar ahora
                </Link>
              )}

              {!session && (
                <p className="text-xs text-center text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href={`/login?next=/cursos/${courseId}`}
                    className="text-primary font-semibold hover:underline"
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
    </div>
  );
}
