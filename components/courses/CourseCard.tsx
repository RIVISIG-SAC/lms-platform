import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  description: string;
  price: number | string | { toNumber(): number };
  thumbnailUrl?: string | null;
  moduleCount: number;
  href: string;
  badge?: React.ReactNode;
};

export function CourseCard({
  id: _id,
  title,
  description,
  price,
  thumbnailUrl,
  moduleCount,
  href,
  badge,
}: Props) {
  return (
    <Link
      href={href}
      className="group bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden relative">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-4xl opacity-30">📚</span>
          </div>
        )}
        {badge && <div className="absolute top-2 right-2">{badge}</div>}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-[var(--foreground)] leading-snug mb-2 group-hover:text-[var(--primary)] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 flex-1 mb-4">
          {description}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted-foreground)]">
            {moduleCount} {moduleCount === 1 ? "módulo" : "módulos"}
          </span>
          <span className="font-semibold text-[var(--foreground)]">
            {formatCurrency(price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
