import { z } from "zod";

import { refresh } from "@/server/auth";
import { handle, json, readBody } from "@/server/http/respond";

/** POST /api/admin/auth/refresh { refresh_token } → a new token pair */
export const POST = handle(async (request) => {
  const { refresh_token } = await readBody(request, z.object({ refresh_token: z.string().min(1) }));
  return json(await refresh(refresh_token));
});
