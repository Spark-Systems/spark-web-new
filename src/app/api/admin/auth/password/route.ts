import { passwordChangeSchema } from "@/lib/cms/schemas";
import { changePassword, requireSession } from "@/server/auth";
import { handle, json, readBody } from "@/server/http/respond";

/**
 * PUT /api/admin/auth/password { current_password, new_password }. Signs out
 * every other session and returns fresh tokens for this one.
 */
export const PUT = handle(async (request) => {
  const { user } = await requireSession(request);
  const { current_password, new_password } = await readBody(request, passwordChangeSchema);
  return json(await changePassword(user.id, current_password, new_password));
});
