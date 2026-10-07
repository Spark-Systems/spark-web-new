import { collectionRoutes } from "@/server/http/collection-routes";

const routes = collectionRoutes("projects");

export const GET = routes.list;
export const POST = routes.create;
