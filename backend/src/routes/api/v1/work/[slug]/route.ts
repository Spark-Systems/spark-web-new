import { getNextProjectData, getProjectData } from "@/server/content/pages";
import { notFoundError } from "@/server/db/errors";
import { readOptions } from "@/server/http/read-options";
import { handle, json } from "@/server/http/respond";

/** GET /api/v1/work/:slug: a published case study, plus the project its "Next" panel leads to. */
export const GET = handle<{ params: Promise<{ slug: string }> }>(async (request, { params }) => {
  const { slug } = await params;
  const options = readOptions(request);
  const [project, next] = await Promise.all([getProjectData(slug, options), getNextProjectData(slug, options)]);
  if (!project) throw notFoundError("Project");
  return json({ ...project, next });
});
