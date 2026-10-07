import { collectionRoutes } from "@/server/http/collection-routes";

/** POST /api/admin/partners/:id/publish | unpublish | discard */
export const POST = collectionRoutes("partners").act;
