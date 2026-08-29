import type { Metadata } from 'next';
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
import { LEGAL_COMPANY } from '@/lib/legal/company';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rivisig.com';

export async function generateMetadata(props: { params: Promise<unknown> }): Promise<Metadata> {
  const { courseId } = (await props.params) as { courseId: string };
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { include: { user: { select: { name: true } } } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return {};

  const canonical = `${SITE_URL}/cursos/${course.id}`;
  const enrollmentCount = course._count?.enrollments ?? 0;
  const description =
    course.description.length > 160
      ? `${course.description.slice(0, 157).trimEnd()}…`
      : course.description;

  return {
    title: { absolute: course.title },
    description,
    keywords: [
      course.title,
      course.category ?? '',
      'Curso ISO online',
      'Certificación ISO',
      LEGAL_COMPANY.marca,
    ].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `${course.title} — ${LEGAL_COMPANY.marca}`,
      description,
      siteName: LEGAL_COMPANY.marca,
      locale: 'es_PE',
      images: course.thumbnailUrl
        ? [
            {
              url: course.thumbnailUrl,
              width: 1200,
              height: 630,
              alt: course.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} — ${LEGAL_COMPANY.marca}`,
      description,
      images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
    },
    robots: {
      index: course.published,
      follow: course.published,
    },
    other: enrollmentCount > 0
      ? { 'og:see_also': `${SITE_URL}/cursos` }
      : undefined,
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

  const courseUrl = `${SITE_URL}/cursos/${course.id}`;
  const priceNumber = course.isFree ? 0 : Number(course.price);

  const courseLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: courseUrl,
    image: course.thumbnailUrl ?? undefined,
    provider: {
      '@type': 'Organization',
      name: LEGAL_COMPANY.marca,
      sameAs: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    inLanguage: 'es-PE',
    ...(course.category ? { about: course.category } : {}),
    ...(course.level ? { educationalLevel: course.level } : {}),
    offers: {
      '@type': 'Offer',
      url: courseUrl,
      price: priceNumber,
      priceCurrency: 'PEN',
      availability: 'https://schema.org/InStock',
      category: course.isFree ? 'Gratuito' : 'Pago',
    },
    ...(course.instructor
      ? {
          instructor: {
            '@type': 'Person',
            name: course.instructor.user.name,
            ...(course.instructor.title ? { jobTitle: course.instructor.title } : {}),
            ...(course.instructor.avatarUrl ? { image: course.instructor.avatarUrl } : {}),
          },
        }
      : {}),
  };

  const faqLd =
    course.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: course.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cursos',
        item: `${SITE_URL}/cursos`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: course.title,
        item: courseUrl,
      },
    ],
  };

  return (
    <div className="pb-32 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <CoursePreviewHero
        course={course}
        chapterCount={chapterCount}
        previewVideoId={previewVideoId}
        session={session}
        isPaid={isPaid}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
