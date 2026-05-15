import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BlogPostsTable } from "@/components/admin/blog/BlogPostsTable";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { NotebookPen, Plus, Tag as TagIcon } from "lucide-react";

export const metadata = { title: "Blog | Admin" };

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
        _count: { select: { tags: true } },
      },
    }),
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = posts.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">Blog</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4 min-w-0">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <NotebookPen className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Blog editorial</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {posts.length} {posts.length === 1 ? "artículo" : "artículos"} · {publishedCount} publicado
              {publishedCount === 1 ? "" : "s"} · {draftCount} borrador{draftCount === 1 ? "" : "es"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            render={<Link href="/admin/blog/categories" />}
            nativeButton={false}
          >
            <TagIcon className="size-4" /> Categorías
          </Button>
          <Button
            render={<Link href="/admin/blog/new" />}
            nativeButton={false}
            className="shadow-sm"
          >
            <Plus className="size-4" /> Nuevo artículo
          </Button>
        </div>
      </div>

      <BlogPostsTable posts={posts} categories={categories} />
    </div>
  );
}
