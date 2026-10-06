import { getNextProject, getProject } from "@/lib/api/pages";
import { notFoundError } from "@/server/db/errors";
import { handle, json } from "@/server/http/respond";

/** GET /api/v1/work/:slug: a published case study, plus the project its "Next" panel leads to. */
export const GET = handle<{ params: Promise<{ slug: string }> }>(async (_request, { params }) => {
  const { slug } = await params;
  const [project, next] = await Promise.all([getProject(slug), getNextProject(slug)]);
  if (!project) throw notFoundError("Project");
  return json({ ...project, next });
});
