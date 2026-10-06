import { collectionRoutes } from "@/server/http/collection-routes";

/** POST /api/admin/offices/:id/publish | unpublish | discard */
export const POST = collectionRoutes("offices").act;
