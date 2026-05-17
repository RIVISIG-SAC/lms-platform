import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { InstructorCard } from '@/components/instructor/InstructorCard';
import { CoursePreviewHero } from '@/components/landing/course-detail/CoursePreviewHero';
import { CourseTabs } from '@/components/landing/course-detail/CourseTabs';
import { CourseCurriculum } from '@/components/landing/course-detail/CourseCurriculum';
import { CourseFaqSection } from '@/components/landing/course-detail/CourseFaqSection';
import { MobileStickyCta } from '@/components/landing/course-detail/MobileStickyCta';
import { User } from 'lucide-react';

export async function generateMetadata(props: { params: Promise<unknown> }) {
  const { courseId } = (await props.params) as { courseId: string };
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return {};
  return {
    title: `${course.title} — RIVISIG Consultores`,
    description: course.description,
  };
}

export default async function CourseDetailPage(props: {
  params: Promise<unknown>;
}) {
  const { courseId } = (await props.params) as { courseId: string };

  const [course, session] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId, published: true },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            chapters: {
              orderBy: { order: 'asc' },
              select: { id: true, title: true, vimeoVideoId: true },
            },
          },
        },
        _count: { select: { enrollments: true } },
        instructor: {
          include: { user: { select: { name: true } } },
        },
        faqs: { orderBy: { order: 'asc' } },
      },
    }),
    getSession(),
  ]);

  if (!course) notFound();

  const chapterCount = course.modules.reduce(
    (acc, m) => acc + m.chapters.length,
    0,
  );
  const previewVideoId = course.modules[0]?.chapters[0]?.vimeoVideoId ?? null;

  const enrollment = session
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.userId, courseId } },
        select: { status: true },
      })
    : null;

  const isPaid =
    enrollment?.status === 'PAID' || enrollment?.status === 'COMPLETED';

  return (
    <div className="pb-32 lg:pb-16">
      <CoursePreviewHero
        course={course}
        chapterCount={chapterCount}
        previewVideoId={previewVideoId}
        session={session}
        isPaid={isPaid}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <CourseTabs
          contentSlot={<CourseCurriculum modules={course.modules} />}
          instructorSlot={
            course.instructor ? (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                  <User className="size-6 text-primary" />
                  Sobre el instructor
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Conoce a quién te guiará durante el curso.
                </p>
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
            ) : (
              <p className="text-sm text-muted-foreground">
                Información del instructor no disponible.
              </p>
            )
          }
          faqSlot={
            course.faqs.length > 0 ? (
              <CourseFaqSection faqs={course.faqs} />
            ) : null
          }
        />
      </div>

      <MobileStickyCta course={course} session={session} isPaid={isPaid} />
    </div>
  );
}
