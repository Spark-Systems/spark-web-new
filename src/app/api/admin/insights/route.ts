import { collectionRoutes } from "@/server/http/collection-routes";

const routes = collectionRoutes("insights");

export const GET = routes.list;
export const POST = routes.create;
