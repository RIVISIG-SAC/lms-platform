"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  className?: string;
  /** Small = footer. Default = navbar. */
  size?: "sm" | "md";
  /** Force monochrome white (for dark surfaces). */
  variant?: "color" | "white";
};

/**
 * Brand logo. Looks for `/public/images/logo.png` (or `/images/logo-white.png`
 * for the `white` variant) and falls back to the text wordmark if the file
 * is not found yet.
 *
 * Expected assets:
 *   /public/images/logo.png        — 320×80 px, transparent background
 *   /public/images/logo-white.png  — same, white version for dark surfaces
 */
export function SiteLogo({ href = "/", className, size = "md", variant = "color" }: Props) {
  const [errored, setErrored] = useState(false);

  const src = variant === "white" ? "/images/logo-white.png" : "/images/logo.png";
  const imgClass = size === "sm" ? "h-8 w-auto" : "h-10 w-auto";

  const content = errored ? (
    <span
      className={cn(
        "flex items-center gap-1",
        size === "sm" ? "text-base" : "text-xl",
        variant === "white" && "text-white"
      )}
    >
      <span className={cn("font-extrabold tracking-tight", variant === "white" ? "text-white" : "text-foreground")}>
        RIV
      </span>
      <span className={cn("font-extrabold tracking-tight", variant === "white" ? "text-white/80" : "text-primary")}>
        ISIG
      </span>
    </span>
  ) : (
    <Image
      src={src}
      alt="RIVISIG Consultores"
      width={200}
      height={56}
      priority={size === "md"}
      className={cn("object-contain", imgClass)}
      onError={() => setErrored(true)}
    />
  );

  if (!href) return <div className={className}>{content}</div>;

  return (
    <Link href={href} className={cn("flex items-center", className)}>
      {content}
    </Link>
  );
}
