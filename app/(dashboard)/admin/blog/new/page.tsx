import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";
import { createPost } from "@/app/actions/blog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Nuevo artículo | Admin" };

export default async function NewBlogPostPage() {
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/blog" />}>Blog</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Nuevo artículo
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo artículo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Redacta, programa o publica un nuevo artículo del blog.
        </p>
      </div>

      <BlogPostForm action={createPost} categories={categories} tags={tags} />
    </div>
  );
}
