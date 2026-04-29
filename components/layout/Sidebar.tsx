'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Home,
  Globe,
  GraduationCap,
} from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Cursos', href: '/admin/courses', icon: BookOpen },
  { label: 'Estudiantes', href: '/admin/students', icon: Users },
];

const studentNav: NavItem[] = [
  { label: 'Inicio', href: '/student', icon: Home },
  { label: 'Mis Cursos', href: '/student/my-courses', icon: GraduationCap },
  { label: 'Ver cursos', href: '/cursos', icon: Globe },
];

type SidebarProps = {
  role: 'ADMIN' | 'STUDENT';
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'ADMIN' ? adminNav : studentNav;

  return (
    <aside className="w-64 flex-shrink-0 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col min-h-screen">
      <div className="px-6 py-8 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="size-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">
            RIVISG
          </h1>
        </div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-800 mt-2">
          {role === 'ADMIN' ? 'Administración' : 'Aprendizaje'}
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === `/${role.toLowerCase()}`
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  'size-4.5 transition-transform duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-slate-400 group-hover:text-slate-700',
                )}
              />
              {item.label}
              {isActive && (
                <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-sidebar-border/50">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>v1.0.0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </aside>
  );
}
