import { loginSchema } from "@/lib/cms/schemas";
import { login } from "@/server/auth";
import { handle, json, readBody } from "@/server/http/respond";

/** POST /api/admin/auth/login { email, password } → tokens */
export const POST = handle(async (request) => {
  const { email, password } = await readBody(request, loginSchema);
  return json(await login(email, password));
});
