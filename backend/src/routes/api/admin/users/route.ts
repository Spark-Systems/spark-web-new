import { userCreateSchema } from "@/lib/cms/schemas";
import { hashPassword, requireSession } from "@/server/auth";
import { logActivity, users } from "@/server/db";
import { DbError } from "@/server/db/errors";
import { newId, now } from "@/server/db/ids";
import { publicUser } from "@/server/db/users";
import { listQuery } from "@/server/http/list-query";
import { handle, json, readBody } from "@/server/http/respond";

/** GET /api/admin/users (admins only): search, `role` facet, sort, pages. */
export const GET = handle(async (request) => {
  await requireSession(request, "admin");
  const rows = (await users.all()).map(publicUser);
  return json(
    listQuery(rows, new URL(request.url).searchParams, {
      search: (u) => [u.name, u.email],
      defaultSort: "name",
      facets: { role: (u, v) => u.role === v },
    }),
  );
});

/** POST /api/admin/users { name, email, role, password } */
export const POST = handle(async (request) => {
  const { actor } = await requireSession(request, "admin");
  const input = await readBody(request, userCreateSchema);
  const email = input.email.trim().toLowerCase();
  if ((await users.all()).some((u) => u.email === email)) {
    throw new DbError(409, "Another user has this email", "email_taken", "email");
  }
  const user = await users.insert({
    id: newId("usr"),
    name: input.name,
    email,
    role: input.role,
    avatar_url: null,
    created_at: now(),
    last_login_at: null,
    password_hash: await hashPassword(input.password),
    token_version: 0,
  });
  await logActivity(actor, "create", "users", { id: user.id, label: user.email });
  return json(publicUser(user), 201);
});
