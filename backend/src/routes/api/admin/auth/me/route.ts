import { profileSchema } from "@/lib/cms/schemas";
import { requireSession } from "@/server/auth";
import { users } from "@/server/db";
import { DbError } from "@/server/db/errors";
import { publicUser } from "@/server/db/users";
import { handle, json, readBody } from "@/server/http/respond";

/** GET /api/admin/auth/me: the signed-in user. */
export const GET = handle(async (request) => json((await requireSession(request)).user));

/** PUT /api/admin/auth/me { name, email }: update your own profile. */
export const PUT = handle(async (request) => {
  const { user } = await requireSession(request);
  const input = await readBody(request, profileSchema);
  const updated = await users.update(user.id, (current, all) => {
    const email = input.email.trim().toLowerCase();
    if (all.some((u) => u.id !== user.id && u.email === email)) {
      throw new DbError(409, "Another user has this email", "email_taken", "email");
    }
    return { ...current, name: input.name, email };
  });
  return json(publicUser(updated));
});
