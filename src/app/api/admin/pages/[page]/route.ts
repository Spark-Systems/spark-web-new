import { z } from "zod";

import { pageSchemas } from "@/lib/cms/schemas";
import { requireSession } from "@/server/auth";
import { getPageDocument, savePage } from "@/server/db";
import { pageKeyParam } from "@/server/http/page-key";
import { handle, json, readBody } from "@/server/http/respond";
import type { PageContentMap, PageKey } from "@/types/cms";

type Context = { params: Promise<{ page: string }> };

/** GET /api/admin/pages/:page → { content, status, … } (the saved draft). */
export const GET = handle<Context>(async (request, { params }) => {
  await requireSession(request);
  return json(await getPageDocument(await pageKeyParam(params)));
});

/** PUT /api/admin/pages/:page { content } saves the draft; publishing makes it live. */
export const PUT = handle<Context>(async (request, { params }) => {
  const { actor } = await requireSession(request, "editor");
  const page = await pageKeyParam(params);
  const schema = z.object({ content: pageSchemas[page] as z.ZodType<PageContentMap[PageKey]> });
  const { content } = await readBody(request, schema);
  return json(await savePage(page, content, actor));
});
