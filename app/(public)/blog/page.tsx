import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Newspaper } from "lucide-react";
import { BlogPostCard } from "@/components/public/BlogPostCard";
import { getBlogCategories, getPublishedBlogPosts } from "@/lib/queries/blog";

export const metadata = {
  title: "Blog — RIVISIG Consultores",
  description:
    "Artículos técnicos, casos prácticos y novedades sobre sistemas de gestión, ISO y certificación corporativa.",
};

async function BlogList({ category }: { category?: string }) {
  const [posts, categories] = await Promise.all([getPublishedBlogPosts(), getBlogCategories()]);

  const filtered = category
    ? posts.filter((p) => p.category?.slug === category)
    : posts;

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Filtros por categoría */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 -mx-1 px-1">
          <Link
            href="/blog"
            className={`shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              !category
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?cat=${c.slug}`}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                category === c.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {c.name}
              <span className="opacity-60">({c._count.posts})</span>
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-muted/30">
          <Newspaper className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-foreground font-semibold">Aún no hay artículos publicados.</p>
          <p className="text-muted-foreground text-sm mt-1">
            Estamos preparando contenido editorial. Vuelve pronto.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {featured && (
            <BlogPostCard
              slug={featured.slug}
              title={featured.title}
              excerpt={featured.excerpt}
              coverImageUrl={featured.coverImageUrl}
              publishedAt={featured.publishedAt}
              category={featured.category}
              author={featured.author}
              tags={featured.tags}
              featured
            />
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {rest.map((post, index) => (
                <div
                  key={post.id}
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500"
                  style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                >
                  <BlogPostCard
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    coverImageUrl={post.coverImageUrl}
                    publishedAt={post.publishedAt}
                    category={post.category}
                    author={post.author}
                    tags={post.tags}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function BlogListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

type SearchParams = Promise<{ cat?: string }>;

export default async function BlogIndexPage({ searchParams }: { searchParams: SearchParams }) {
  const { cat } = await searchParams;

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-white via-muted/40 to-white">
        <div className="absolute -top-28 -right-20 size-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-36 -left-16 size-80 rounded-full bg-foreground/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 md:pt-18 md:pb-16 relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary">
            Blog RIVISIG
          </Badge>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-9">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.02]">
                Conocimiento práctico para certificar, auditar y mejorar tus sistemas de gestión
              </h1>
              <p className="text-muted-foreground mt-5 text-base max-w-2xl leading-relaxed">
                Artículos técnicos, casos prácticos y novedades normativas escritos por nuestros consultores y auditores.
              </p>
            </div>
            <div className="lg:col-span-3 lg:text-right">
              <Link
                href="/cursos"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
              >
                Ver cursos certificados <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogList category={cat} />
        </Suspense>
      </section>
    </div>
  );
}
