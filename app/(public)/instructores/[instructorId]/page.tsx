import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Globe, ExternalLink, BookOpen, User } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) {
  const { instructorId } = await params;
  const profile = await prisma.instructorProfile.findUnique({
    where: { id: instructorId },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return { title: "Instructor no encontrado" };
  return { title: `${profile.user.name} | Instructor` };
}

export default async function InstructorPublicPage({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) {
  const { instructorId } = await params;

  const profile = await prisma.instructorProfile.findUnique({
    where: { id: instructorId },
    include: {
      user: { select: { name: true } },
      courses: {
        where: { published: true },
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          level: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  if (!profile) notFound();

  const { user, courses } = profile;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        {/* Header */}
        <div className="flex gap-6 items-start">
          <div className="shrink-0">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={user.name}
                width={120}
                height={120}
                className="size-28 rounded-full object-cover border-2 border-border shadow"
              />
            ) : (
              <div className="size-28 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <User className="size-12 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
            {profile.title && (
              <p className="text-base text-muted-foreground mt-1">{profile.title}</p>
            )}
            {profile.specialization && (
              <p className="text-sm text-primary font-medium mt-1">{profile.specialization}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="size-4" />
                  LinkedIn
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Globe className="size-4" />
                  Sitio web
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Sobre el instructor
            </h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Courses */}
        {courses.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="size-4" />
              Cursos que dicta
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/cursos/${course.id}`}
                  className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow group"
                >
                  <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {course.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {course._count.enrollments} estudiante{course._count.enrollments !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
