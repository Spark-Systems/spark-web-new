import { collectionRoutes } from "@/server/http/collection-routes";

/** POST /api/admin/jobs/:id/publish | unpublish | discard */
export const POST = collectionRoutes("jobs").act;
