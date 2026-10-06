import { collectionRoutes } from "@/server/http/collection-routes";

const routes = collectionRoutes("clients");

export const GET = routes.list;
export const POST = routes.create;
