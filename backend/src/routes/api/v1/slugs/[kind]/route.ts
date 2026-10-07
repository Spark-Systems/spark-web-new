import { getDetailSlugs, getInsightSlugs } from "@/server/content/pages";
import { notFoundError } from "@/server/db/errors";
import { handle, json } from "@/server/http/respond";

const readers: Record<string, () => Promise<string[]>> = {
  solutions: () => getDetailSlugs("solutions"),
  services: () => getDetailSlugs("services"),
  work: () => getDetailSlugs("projects"),
  insights: getInsightSlugs,
};

/**
 * GET /api/v1/slugs/:kind: the published detail pages of solutions, services,
 * work or insights (the website pre-renders these when it's built).
 */
export const GET = handle<{ params: Promise<{ kind: string }> }>(async (_request, { params }) => {
  const read = readers[(await params).kind];
  if (!read) throw notFoundError("List");
  return json(await read());
});
