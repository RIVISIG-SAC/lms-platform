import {
  MonitorPlay,
  Book,
  BadgeCheck,
  Newspaper,
  Info,
  type LucideIcon,
} from 'lucide-react';

export type NavLink = { href: string; label: string; Icon: LucideIcon };

export const NAV_LINKS: NavLink[] = [
  { href: '/cursos', label: 'Cursos', Icon: MonitorPlay },
  { href: '/servicios', label: 'Servicios', Icon: Book },
  { href: '/metodologia', label: 'Metodología', Icon: BadgeCheck },
  { href: '/blog', label: 'Blog', Icon: Newspaper },
  { href: '/about', label: 'Nosotros', Icon: Info },
];
