import { collectionRoutes } from "@/server/http/collection-routes";

const routes = collectionRoutes("services");

export const GET = routes.get;
export const PUT = routes.update;
export const DELETE = routes.remove;
