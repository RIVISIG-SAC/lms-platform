import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag as TagIcon, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogPostCard } from "@/components/public/BlogPostCard";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/queries/blog";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Artículo no encontrado" };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const ogImage = post.ogImageUrl || post.coverImageUrl || undefined;
  const canonical = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${title} — Blog RIVISIG`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: { index: !post.noIndex, follow: !post.noIndex },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const related = await getRelatedBlogPosts(post.id, post.categoryId, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.seoDescription || undefined,
    image: post.ogImageUrl || post.coverImageUrl || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author.name },
    publisher: {
      "@type": "Organization",
      name: "RIVISIG Consultores",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="relative overflow-hidden border-b border-border bg-linear-to-b from-white via-muted/30 to-white">
        <div className="absolute -top-28 -right-20 size-80 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="size-3.5" />
            Volver al blog
          </Link>

          {post.category && (
            <Link href={`/blog?cat=${post.category.slug}`}>
              <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary gap-1">
                <TagIcon className="size-3" />
                {post.category.name}
              </Badge>
            </Link>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.05]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-muted-foreground mt-5 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-8 pt-6 border-t border-border/60">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{post.author.name}</span>
            </div>
            {post.publishedAt && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5" />
                {formatDate(post.publishedAt)}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cover image full-bleed */}
      {post.coverImageUrl && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-2xl border border-border shadow-sm"
          />
        </div>
      )}

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border/60">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Etiquetas
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="secondary" className="gap-1">
                  <TagIcon className="size-3" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="flex items-end justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                Sigue leyendo
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold">Artículos relacionados</h2>
            </div>
            <Link
              href="/blog"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <BlogPostCard
                key={p.id}
                slug={p.slug}
                title={p.title}
                excerpt={p.excerpt}
                coverImageUrl={p.coverImageUrl}
                publishedAt={p.publishedAt}
                category={p.category}
                author={p.author}
                tags={p.tags}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
