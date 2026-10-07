import { collectionRoutes } from "@/server/http/collection-routes";

/** POST /api/admin/insights/:id/publish | unpublish | discard */
export const POST = collectionRoutes("insights").act;
