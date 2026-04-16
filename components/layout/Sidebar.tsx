"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Cursos", href: "/admin/courses", icon: "📚" },
  { label: "Estudiantes", href: "/admin/students", icon: "👥" },
];

const studentNav: NavItem[] = [
  { label: "Inicio", href: "/student", icon: "🏠" },
  { label: "Catálogo", href: "/student/catalog", icon: "📖" },
  { label: "Mis Cursos", href: "/student/my-courses", icon: "🎓" },
];

type SidebarProps = {
  role: "ADMIN" | "STUDENT";
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? adminNav : studentNav;

  return (
    <aside className="w-64 flex-shrink-0 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-semibold text-white tracking-tight">
          Cursos Pro
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {role === "ADMIN" ? "Panel Administrativo" : "Portal del Estudiante"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-[var(--sidebar-active)] text-white"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} Cursos Pro
      </div>
    </aside>
  );
}
