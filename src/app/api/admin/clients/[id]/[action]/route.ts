import { collectionRoutes } from "@/server/http/collection-routes";

/** POST /api/admin/clients/:id/publish | unpublish | discard */
export const POST = collectionRoutes("clients").act;
