import { userUpdateSchema } from "@/lib/cms/schemas";
import { hashPassword, requireSession } from "@/server/auth";
import { logActivity, users } from "@/server/db";
import { DbError, notFoundError } from "@/server/db/errors";
import { publicUser, type StoredUser } from "@/server/db/users";
import { handle, json, noContent, readBody } from "@/server/http/respond";

type Context = { params: Promise<{ id: string }> };

/** There must always be at least one admin left. */
const otherAdmins = (all: StoredUser[], id: string) => all.some((u) => u.id !== id && u.role === "admin");

export const GET = handle<Context>(async (request, { params }) => {
  await requireSession(request, "admin");
  const user = await users.get((await params).id);
  if (!user) throw notFoundError("User");
  return json(publicUser(user));
});

/** PUT /api/admin/users/:id { name, email, role, password } (an empty password keeps the current one). */
export const PUT = handle<Context>(async (request, { params }) => {
  const { actor } = await requireSession(request, "admin");
  const { id } = await params;
  const input = await readBody(request, userUpdateSchema);
  const hash = input.password ? await hashPassword(input.password) : null;
  const email = input.email.trim().toLowerCase();
  const updated = await users.update(id, (current, all) => {
    if (all.some((u) => u.id !== id && u.email === email)) {
      throw new DbError(409, "Another user has this email", "email_taken", "email");
    }
    if (current.role === "admin" && input.role !== "admin" && !otherAdmins(all, id)) {
      throw new DbError(422, "Keep at least one admin", "last_admin", "role");
    }
    return {
      ...current,
      name: input.name,
      email,
      role: input.role,
      // A new password also signs the user out everywhere.
      ...(hash ? { password_hash: hash, token_version: current.token_version + 1 } : {}),
    };
  });
  await logActivity(actor, "update", "users", { id, label: updated.email });
  return json(publicUser(updated));
});

export const DELETE = handle<Context>(async (request, { params }) => {
  const { actor } = await requireSession(request, "admin");
  const { id } = await params;
  if (id === actor.id) throw new DbError(422, "You can't delete your own account", "self_delete");
  const all = await users.all();
  const target = all.find((u) => u.id === id);
  if (!target) throw notFoundError("User");
  if (target.role === "admin" && !otherAdmins(all, id)) throw new DbError(422, "Keep at least one admin", "last_admin");
  await users.remove([id]);
  await logActivity(actor, "delete", "users", { id, label: target.email });
  return noContent();
});
