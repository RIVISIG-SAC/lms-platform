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
  UserCircle,
  Award,
  NotebookPen,
  X,
} from 'lucide-react';
import { useSidebarContext } from './MobileShell';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Cursos', href: '/admin/courses', icon: BookOpen },
  { label: 'Blog', href: '/admin/blog', icon: NotebookPen },
  { label: 'Certificados', href: '/admin/certificates', icon: Award },
  { label: 'Usuarios', href: '/admin/users', icon: Users },
  { label: 'Mi Perfil', href: '/admin/profile', icon: UserCircle },
];

const studentNav: NavItem[] = [
  { label: 'Mis Cursos', href: '/student/my-courses', icon: GraduationCap },
  { label: 'Inicio', href: '/student', icon: Home },
  { label: 'Certificados', href: '/student/certificates', icon: Award },
  { label: 'Explorar Cursos', href: '/cursos', icon: Globe },
  { label: 'Mi Perfil', href: '/student/profile', icon: UserCircle },
];

const instructorNav: NavItem[] = [
  { label: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
  { label: 'Mis Cursos', href: '/instructor/courses', icon: BookOpen },
  { label: 'Mi Perfil', href: '/instructor/profile', icon: UserCircle },
];

type SidebarProps = {
  role: 'ADMIN' | 'STUDENT' | 'INSTRUCTOR';
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { setIsOpen } = useSidebarContext();
  const navItems =
    role === 'ADMIN' ? adminNav :
    role === 'INSTRUCTOR' ? instructorNav :
    studentNav;

  return (
    <aside className="w-64 shrink-0 bg-sidebar-bg text-sidebar-text flex flex-col min-h-screen relative">
      <div className="px-6 py-8 border-b border-border/50">
        <div className="flex items-center justify-between gap-2 mb-1">
          <img src="/images/logo.png" alt="logo rivisig" className="h-10 w-auto" />
          <button
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-foreground/60 mt-2">
          {role === 'ADMIN' ? 'Administración' : role === 'INSTRUCTOR' ? 'Instructor' : 'Aprendizaje'}
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const rootHref =
            role === 'ADMIN' ? '/admin' :
            role === 'INSTRUCTOR' ? '/instructor' :
            '/student';
          const isActive =
            item.href === rootHref
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  'size-4 transition-colors duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              {item.label}
              {isActive && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-border/50">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
          <span>v1.0.0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </aside>
  );
}
