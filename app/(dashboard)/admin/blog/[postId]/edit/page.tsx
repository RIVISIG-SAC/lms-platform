import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";
import { updatePost } from "@/app/actions/blog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Editar artículo | Admin" };

type Params = Promise<{ postId: string }>;

export default async function EditBlogPostPage({ params }: { params: Params }) {
  const { postId } = await params;

  const [post, categories, tags] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id: postId },
      include: { tags: { select: { tagId: true } } },
    }),
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!post) notFound();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/blog" />}>Blog</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium line-clamp-1 max-w-[40ch]">
              {post.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar artículo</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">/blog/{post.slug}</p>
      </div>

      <BlogPostForm
        action={updatePost}
        categories={categories}
        tags={tags}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          status: post.status,
          publishedAt: post.publishedAt,
          categoryId: post.categoryId,
          tagIds: post.tags.map((t) => t.tagId),
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          ogImageUrl: post.ogImageUrl,
          canonicalUrl: post.canonicalUrl,
          noIndex: post.noIndex,
        }}
      />
    </div>
  );
}
