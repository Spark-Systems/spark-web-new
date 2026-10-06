import "server-only";

import type { z } from "zod";

import { logoSchema, officeSchema, projectSchema, serviceSchema, solutionSchema } from "@/lib/cms/schemas";
import { requireSession } from "@/server/auth";
import { revalidateContent } from "@/server/content/revalidate";
import { collections } from "@/server/db";
import type { CollectionKey, CollectionMap, CollectionRow, PublishAction } from "@/types/cms";
import { listQuery, type ListQueryOptions } from "./list-query";
import { handle, HttpError, json, noContent, readBody } from "./respond";

const yesNo = (value: boolean, wanted: string) => (value ? "yes" : "no") === wanted;

type Row<K extends CollectionKey> = CollectionRow<CollectionMap[K]>;

/** Validation and list behaviour of each draft/publish list. */
const config: { [K in CollectionKey]: { schema: z.ZodType<CollectionMap[K]>; list: ListQueryOptions<Row<K>> } } = {
  solutions: {
    schema: solutionSchema,
    list: {
      search: (r) => [r.name, r.slug],
      defaultSort: "order",
      facets: { flagship: (r, v) => yesNo(r.flagship, v), detail: (r, v) => yesNo(r.has_detail, v) },
    },
  },
  services: {
    schema: serviceSchema,
    list: { search: (r) => [r.name, r.slug], defaultSort: "order", facets: { detail: (r, v) => yesNo(r.has_detail, v) } },
  },
  projects: {
    schema: projectSchema,
    list: {
      search: (r) => [r.name, r.slug, r.category],
      defaultSort: "order",
      facets: { detail: (r, v) => yesNo(r.has_detail, v), category: (r, v) => r.category === v },
    },
  },
  clients: { schema: logoSchema, list: { search: (r) => [r.name], defaultSort: "order" } },
  partners: { schema: logoSchema, list: { search: (r) => [r.name], defaultSort: "order" } },
  offices: { schema: officeSchema, list: { search: (r) => [r.city, r.country, r.address], defaultSort: "order" } },
};

const ACTIONS: PublishAction[] = ["publish", "unpublish", "discard"];

type IdContext = { params: Promise<{ id: string }> };
type ActionContext = { params: Promise<{ id: string; action: string }> };

/**
 * Route handlers for a draft/publish list at /api/admin/<key>:
 *
 * - `GET    /<key>`              list (search, facets incl. `status`, sort, pages)
 * - `POST   /<key>`              create a draft (`?publish=true` publishes it at once)
 * - `GET    /<key>/:id`          one item
 * - `PUT    /<key>/:id`          save the draft
 * - `DELETE /<key>/:id`          delete (from the website too)
 * - `POST   /<key>/:id/:action`  publish, unpublish or discard (back to the published version)
 *
 * Reading needs any signed-in user; changes need an editor.
 */
export function collectionRoutes<K extends CollectionKey>(key: K) {
  const collection = collections[key];
  const { schema, list } = config[key];
  // Every list also filters by publication status: ?status=draft,published,changed
  const listOptions: ListQueryOptions<Row<K>> = {
    ...list,
    facets: { ...list.facets, status: (row, value) => row.status === value },
  };

  return {
    list: handle(async (request) => {
      await requireSession(request);
      const rows = (await collection.rows()) as Row<K>[];
      return json(listQuery(rows, new URL(request.url).searchParams, listOptions));
    }),

    create: handle(async (request) => {
      const { actor } = await requireSession(request, "editor");
      const input = await readBody(request, schema);
      const publish = new URL(request.url).searchParams.get("publish") === "true";
      const row = await collection.create(input, actor, { publish });
      if (publish) revalidateContent();
      return json(row, 201);
    }),

    get: handle<IdContext>(async (request, { params }) => {
      await requireSession(request);
      return json(await collection.row((await params).id));
    }),

    update: handle<IdContext>(async (request, { params }) => {
      const { actor } = await requireSession(request, "editor");
      const input = await readBody(request, schema);
      // Saving changes the draft only; the website changes on publish.
      return json(await collection.update((await params).id, input, actor));
    }),

    remove: handle<IdContext>(async (request, { params }) => {
      const { actor } = await requireSession(request, "editor");
      await collection.remove([(await params).id], actor);
      revalidateContent();
      return noContent();
    }),

    act: handle<ActionContext>(async (request, { params }) => {
      const { actor } = await requireSession(request, "editor");
      const { id, action } = await params;
      if (!ACTIONS.includes(action as PublishAction)) throw new HttpError(404, "Unknown action", "not_found");
      const row = await collection.act(id, action as PublishAction, actor);
      revalidateContent();
      return json(row);
    }),
  };
}
