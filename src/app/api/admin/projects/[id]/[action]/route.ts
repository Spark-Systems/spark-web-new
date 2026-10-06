import { collectionRoutes } from "@/server/http/collection-routes";

/** POST /api/admin/projects/:id/publish | unpublish | discard */
export const POST = collectionRoutes("projects").act;
