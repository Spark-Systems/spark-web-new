import { pageKeys } from "@/lib/cms/schemas";
import { requireSession } from "@/server/auth";
import { activityLog, collections, enquiries, getPageDocument } from "@/server/db";
import { handle, json } from "@/server/http/respond";
import type { CollectionKey, PublishStatus } from "@/types/cms";

const titleOf: Record<CollectionKey, (row: Record<string, unknown>) => string> = {
  solutions: (r) => String(r.name),
  services: (r) => String(r.name),
  projects: (r) => String(r.name),
  clients: (r) => String(r.name),
  partners: (r) => String(r.name),
  offices: (r) => String(r.city),
  jobs: (r) => String(r.title),
  insights: (r) => String(r.title),
};

export interface OverviewPending {
  kind: "page" | "item";
  /** Page key ("home") or list key ("solutions"). */
  resource: string;
  id: string | null;
  label: string;
  status: Exclude<PublishStatus, "published">;
  updated_at: string;
  updated_by: string | null;
}

/**
 * GET /api/admin/overview: the dashboard summary. Everything not yet live
 * (drafts and unpublished changes), per-list counts, the newest unread
 * enquiries and the latest activity.
 */
export const GET = handle(async (request) => {
  await requireSession(request);

  const [pages, lists, allEnquiries, activity] = await Promise.all([
    Promise.all(pageKeys.map(async (key) => ({ key, doc: await getPageDocument(key) }))),
    Promise.all((Object.keys(collections) as CollectionKey[]).map(async (key) => ({ key, rows: await collections[key].rows() }))),
    enquiries.all(),
    activityLog.all(),
  ]);

  const pending: OverviewPending[] = [
    ...pages
      .filter(({ doc }) => doc.status !== "published")
      .map(({ key, doc }) => ({
        kind: "page" as const,
        resource: key,
        id: null,
        label: key,
        status: doc.status as OverviewPending["status"],
        updated_at: doc.updated_at,
        updated_by: doc.updated_by,
      })),
    ...lists.flatMap(({ key, rows }) =>
      rows
        .filter((row) => row.status !== "published")
        .map((row) => ({
          kind: "item" as const,
          resource: key,
          id: row.id,
          label: titleOf[key](row as unknown as Record<string, unknown>),
          status: row.status as OverviewPending["status"],
          updated_at: row.updated_at,
          updated_by: row.updated_by,
        })),
    ),
  ].sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  const unread = allEnquiries.filter((e) => e.status === "new");

  return json({
    pending,
    counts: Object.fromEntries(
      lists.map(({ key, rows }) => [key, { total: rows.length, published: rows.filter((r) => r.status !== "draft").length }]),
    ),
    enquiries: { new: unread.length, total: allEnquiries.length, latest: unread.slice(-5).reverse() },
    activity: activity.slice(-8).reverse(),
  });
});
