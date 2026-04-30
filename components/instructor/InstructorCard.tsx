import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Globe, User } from "lucide-react";

type Props = {
  instructorId: string;
  name: string;
  title?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  linkedin?: string | null;
  website?: string | null;
  showLink?: boolean;
};

export function InstructorCard({
  instructorId,
  name,
  title,
  bio,
  avatarUrl,
  linkedin,
  website,
  showLink = true,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex gap-4">
      <div className="shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={64}
            height={64}
            className="size-16 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="size-16 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center">
            <User className="size-7 text-primary" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-foreground text-sm">{name}</p>
            {title && (
              <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <ExternalLink className="size-4" />
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Sitio web"
              >
                <Globe className="size-4" />
              </a>
            )}
          </div>
        </div>
        {bio && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{bio}</p>
        )}
        {showLink && (
          <Link
            href={`/instructores/${instructorId}`}
            className="text-xs text-primary underline mt-2 inline-block"
          >
            Ver perfil completo →
          </Link>
        )}
      </div>
    </div>
  );
}
