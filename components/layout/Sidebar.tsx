'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Home,
  Compass,
  GraduationCap,
  UserCircle,
  Award,
  NotebookPen,
  ShieldCheck,
  HelpCircle,
  LifeBuoy,
  LogOut,
  X,
} from 'lucide-react';
import { useSidebarContext } from './MobileShell';
import { logoutAction } from '@/app/actions/auth';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const adminNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Académico',
    items: [
      { label: 'Cursos', href: '/admin/courses', icon: BookOpen },
      { label: 'Estudiantes', href: '/admin/students', icon: GraduationCap },
      { label: 'Certificados', href: '/admin/certificates', icon: Award },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { label: 'Blog', href: '/admin/blog', icon: NotebookPen },
      { label: 'FAQ Global', href: '/admin/faq', icon: HelpCircle },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Usuarios', href: '/admin/users', icon: ShieldCheck },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Mi Perfil', href: '/admin/profile', icon: UserCircle },
    ],
  },
];

const studentNav: NavSection[] = [
  {
    items: [
      { label: 'Inicio', href: '/student', icon: Home },
    ],
  },
  {
    title: 'Aprendizaje',
    items: [
      { label: 'Mis Cursos', href: '/student/my-courses', icon: GraduationCap },
      { label: 'Certificados', href: '/student/certificates', icon: Award },
    ],
  },
  {
    title: 'Descubre',
    items: [
      { label: 'Explorar Cursos', href: '/cursos', icon: Compass },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { label: 'Guía del estudiante', href: '/student/guia', icon: BookOpen },
      { label: 'FAQ y Ayuda', href: '/student/faq', icon: LifeBuoy },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Mi Perfil', href: '/student/profile', icon: UserCircle },
    ],
  },
];

const instructorNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Enseñanza',
    items: [
      { label: 'Mis Cursos', href: '/instructor/courses', icon: BookOpen },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Mi Perfil', href: '/instructor/profile', icon: UserCircle },
    ],
  },
];

type SidebarProps = {
  role: 'ADMIN' | 'STUDENT' | 'INSTRUCTOR';
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { setIsOpen } = useSidebarContext();
  const navSections =
    role === 'ADMIN' ? adminNav :
    role === 'INSTRUCTOR' ? instructorNav :
    studentNav;
  const rootHref =
    role === 'ADMIN' ? '/admin' :
    role === 'INSTRUCTOR' ? '/instructor' :
    '/student';

  return (
    <aside className="w-64 shrink-0 bg-sidebar-bg text-sidebar-text flex flex-col h-full relative">
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

      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <div key={section.title ?? `section-${sectionIdx}`} className="space-y-1">
            {section.title && (
              <p className="px-3 mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
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
          </div>
        ))}
      </nav>

      <div className="px-3 pt-3 pb-2 border-t border-border/50">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 group cursor-pointer"
          >
            <LogOut
              aria-hidden="true"
              className="size-4 text-muted-foreground group-hover:text-destructive transition-colors duration-200"
            />
            Cerrar sesión
          </button>
        </form>
      </div>

      <div className="px-6 py-4 border-t border-border/50">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
          <span>v1.0.0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </aside>
  );
}
