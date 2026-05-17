import Link from "next/link";
import { Scale, CalendarClock } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { formatLegalDate } from "@/lib/legal/company";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdatedIso: string;
  documentTitle: string;
  children: React.ReactNode;
};

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  lastUpdatedIso,
  documentTitle,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <section className="bg-foreground text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="max-w-3xl mx-auto space-y-5">
            <Badge
              variant="outline"
              className="border-primary/40 text-primary bg-primary/10 text-xs font-medium px-3 py-1"
            >
              <Scale className="size-3 mr-1.5" />
              {eyebrow}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
              {title}
            </h1>

            <p className="text-base text-primary-foreground/70 leading-relaxed max-w-2xl">
              {description}
            </p>

            <div className="flex items-center gap-2 text-xs text-primary-foreground/60 pt-2">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              <span>
                Última actualización:{" "}
                <time dateTime={lastUpdatedIso}>
                  {formatLegalDate(lastUpdatedIso)}
                </time>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/">Inicio</Link>} />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-muted-foreground">Legal</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{documentTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose-blog">
        {children}
      </article>
    </>
  );
}
