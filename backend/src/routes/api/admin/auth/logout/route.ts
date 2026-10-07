import { handle, noContent } from "@/server/http/respond";

/**
 * POST /api/admin/auth/logout. Tokens are stateless and the client deletes
 * them; changing the password is what revokes every session.
 */
export const POST = handle(async () => noContent());
