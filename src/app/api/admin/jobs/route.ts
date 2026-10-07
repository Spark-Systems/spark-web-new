import { collectionRoutes } from "@/server/http/collection-routes";

const routes = collectionRoutes("jobs");

export const GET = routes.list;
export const POST = routes.create;
