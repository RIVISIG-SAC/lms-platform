import { cn } from '@/lib/utils';
import { LinkedIn } from '@/components/ui/icons-social/LinkedIn';
import { Facebook } from '@/components/ui/icons-social/Facebook';
import { Instagram } from '@/components/ui/icons-social/Instagram';
import { TikTok } from '@/components/ui/icons-social/TikTok';
import { YouTube } from '@/components/ui/icons-social/YouTube';

const SOCIALS = [
  {
    href: 'https://pe.linkedin.com/company/rivisig-sac',
    label: 'LinkedIn',
    Icon: LinkedIn,
  },
  {
    href: 'https://www.facebook.com/RIVISIG.SAC',
    label: 'Facebook',
    Icon: Facebook,
  },
  {
    href: 'https://www.instagram.com/rvgestion/',
    label: 'Instagram',
    Icon: Instagram,
  },
  {
    href: 'https://www.tiktok.com/@rivisig',
    label: 'TikTok',
    Icon: TikTok,
  },
  {
    href: 'https://www.youtube.com/@rivisig',
    label: 'YouTube',
    Icon: YouTube,
  },
];

export function SocialLinks({
  className,
  iconClassName = 'h-4 w-4',
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {SOCIALS.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          className="hover:text-primary-foreground transition-colors font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
