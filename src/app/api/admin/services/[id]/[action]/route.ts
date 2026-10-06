import { collectionRoutes } from "@/server/http/collection-routes";

/** POST /api/admin/services/:id/publish | unpublish | discard */
export const POST = collectionRoutes("services").act;
