/** Standard list response for the admin's server-side tables. */
export interface Paginated<T> {
  data: T[];
  /** Rows matching the search and filters, across all pages. */
  total: number;
}

export interface ListQueryOptions<T> {
  /** Text the `q` search looks in. */
  search: (row: T) => string[];
  /**
   * Facet filters by query key: does the row match one of the requested
   * values? Sent as comma lists, e.g. `status=published,changed`.
   */
  facets?: Record<string, (row: T, value: string) => boolean>;
  /** Sort field when none is requested. */
  defaultSort: keyof T & string;
  defaultOrder?: "asc" | "desc";
}

const MAX_PAGE_SIZE = 100;

function compare(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a ?? "").localeCompare(String(b ?? ""), "en", { numeric: true, sensitivity: "base" });
}

/**
 * Search, facet filters, sort and pagination for a list endpoint, from the
 * query string the admin's data tables send (`q`, `sort`, `order`, `page`,
 * `page_size`, plus one key per facet).
 */
export function listQuery<T extends object>(rows: T[], params: URLSearchParams, options: ListQueryOptions<T>): Paginated<T> {
  const q = params.get("q")?.trim().toLowerCase() ?? "";
  const sortKey = params.get("sort");
  const sort = (sortKey && rows.length > 0 && sortKey in rows[0] ? sortKey : options.defaultSort) as keyof T;
  const desc = (params.get("order") ?? options.defaultOrder) === "desc";
  const page = Math.max(Number(params.get("page")) || 1, 1);
  const size = Math.min(Math.max(Number(params.get("page_size")) || 10, 1), MAX_PAGE_SIZE);

  const filtered = rows
    .filter((row) => !q || options.search(row).some((text) => text.toLowerCase().includes(q)))
    .filter((row) =>
      Object.entries(options.facets ?? {}).every(([key, matches]) => {
        const values = params.get(key)?.split(",").filter(Boolean) ?? [];
        return values.length === 0 || values.some((value) => matches(row, value));
      }),
    )
    .sort((a, b) => (desc ? -1 : 1) * compare(a[sort], b[sort]));

  return { data: filtered.slice((page - 1) * size, page * size), total: filtered.length };
}
