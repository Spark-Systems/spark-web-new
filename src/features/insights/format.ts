import { routes } from "@/config/site";

/** "2021-07-15" → "15 Jul 2021" (fixed locale/time zone, so server and browser agree). */
export function formatInsightDate(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export const insightHref = (slug: string) => routes.insight(slug);
