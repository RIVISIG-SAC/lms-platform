"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

type Props = {
  /** Pestaña que se muestra cuando la URL no trae `?tab=`. */
  defaultTab: string;
  /** Parámetros de filtro/paginación que dejan de aplicar al cambiar de pestaña. */
  resetParams?: string[];
  className?: string;
  children: React.ReactNode;
};

/**
 * Pestañas cuyo estado vive en la URL.
 *
 * Hace falta cuando una pestaña contiene una lista paginada: sin esto, pasar a
 * la página 2 recargaría la vista en la primera pestaña y el enlace no sería
 * compartible.
 */
export function UrlTabs({
  defaultTab,
  resetParams = ["page", "q"],
  className,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get("tab") ?? defaultTab;

  function handleChange(next: unknown) {
    const tab = String(next);
    const params = new URLSearchParams(searchParams.toString());

    if (tab === defaultTab) params.delete("tab");
    else params.set("tab", tab);
    for (const param of resetParams) params.delete(param);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <Tabs value={value} onValueChange={handleChange} className={className}>
      {children}
    </Tabs>
  );
}
