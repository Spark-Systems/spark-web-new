import { collectionRoutes } from "@/server/http/collection-routes";

/** POST /api/admin/solutions/:id/publish | unpublish | discard */
export const POST = collectionRoutes("solutions").act;
