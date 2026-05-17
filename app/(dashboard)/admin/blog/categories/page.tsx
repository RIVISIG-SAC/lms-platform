import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/blog/CategoriesManager";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Categorías del blog | Admin" };

export default async function BlogCategoriesPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/blog" />}>Blog</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">Categorías</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categorías del blog</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organiza tus artículos en temáticas para facilitar la navegación pública.
        </p>
      </div>

      <CategoriesManager categories={categories} />
    </div>
  );
}
