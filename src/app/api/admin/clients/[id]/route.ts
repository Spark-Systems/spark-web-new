import { collectionRoutes } from "@/server/http/collection-routes";

const routes = collectionRoutes("clients");

export const GET = routes.get;
export const PUT = routes.update;
export const DELETE = routes.remove;
