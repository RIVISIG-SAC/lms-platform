/**
 * Paginación del panel de administración.
 *
 * El estado vive en la URL (`?page=2&q=juan`), no en React: así el back del
 * navegador funciona, los enlaces se pueden compartir y cada listado consulta
 * a la BD sólo la página que se está viendo.
 */

export const DEFAULT_PAGE_SIZE = 20;

/** Tamaños que el admin puede elegir desde el selector de la paginación. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

/** Primer valor de un search param, ya recortado; `undefined` si viene vacío. */
export function getSearchParam(
  searchParams: SearchParamsRecord,
  key: string,
): string | undefined {
  const raw = searchParams[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value : undefined;
}

/**
 * Lee un parámetro que sólo admite valores de una lista cerrada (estados,
 * niveles, roles...). Cualquier cosa fuera de la lista cae al `fallback`, así
 * una URL manipulada nunca llega al `where` de Prisma.
 */
export function getEnumParam<const T extends readonly string[]>(
  searchParams: SearchParamsRecord,
  key: string,
  allowed: T,
  fallback: T[number] | "all" = "all",
): T[number] | "all" {
  const value = getSearchParam(searchParams, key);
  if (!value) return fallback;
  return (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback;
}

export function getPageSize(
  searchParams: SearchParamsRecord,
  fallback: number = DEFAULT_PAGE_SIZE,
): number {
  const value = Number(getSearchParam(searchParams, "size"));
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
    ? value
    : fallback;
}

export function getRequestedPage(searchParams: SearchParamsRecord): number {
  const value = Number(getSearchParam(searchParams, "page"));
  return Number.isInteger(value) && value > 0 ? value : 1;
}

export type PaginationMeta = {
  /** Página efectiva, ya acotada al rango disponible. */
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  /** `skip` listo para pasar a Prisma. */
  skip: number;
  /** Posición 1-indexada del primer y último registro de la página. */
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
};

/**
 * Calcula la paginación a partir del total real de filas.
 *
 * Acota la página pedida al rango existente: si el admin estaba en la página 5
 * y se borran registros, se le devuelve la última página con datos en lugar de
 * una tabla vacía.
 */
export function buildPagination(params: {
  requestedPage: number;
  pageSize: number;
  totalItems: number;
}): PaginationMeta {
  const { requestedPage, totalItems } = params;
  const pageSize = Math.max(1, params.pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    skip,
    from: totalItems === 0 ? 0 : skip + 1,
    to: Math.min(skip + pageSize, totalItems),
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

/**
 * Ventana de páginas a mostrar, con `null` donde va una elipsis.
 * Siempre incluye la primera y la última.
 */
export function getPageWindow(
  page: number,
  totalPages: number,
  siblings = 1,
): (number | null)[] {
  const maxSlots = siblings * 2 + 5; // primera + última + actual + 2 elipsis
  if (totalPages <= maxSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);
  const pages: (number | null)[] = [1];

  if (start > 2) pages.push(null);
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push(null);

  pages.push(totalPages);
  return pages;
}
