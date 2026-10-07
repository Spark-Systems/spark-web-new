import { collectionRoutes } from "@/server/http/collection-routes";

const routes = collectionRoutes("solutions");

export const GET = routes.list;
export const POST = routes.create;
