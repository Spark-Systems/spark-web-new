import { routeTable } from "../routes.gen";
import { createRouter } from "./router";
import { serveUpload } from "./uploads";

const route = createRouter(routeTable);

const notFound = () => Response.json({ message: "Not found" }, { status: 404 });

/** Every request: uploaded files, the health check, and the API routes in src/routes. */
export async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  const method = request.method.toUpperCase();

  if (pathname.startsWith("/uploads/")) {
    if (method !== "GET" && method !== "HEAD") return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
    let filePath: string;
    try {
      filePath = decodeURIComponent(pathname.slice("/uploads/".length));
    } catch {
      return notFound();
    }
    return serveUpload(filePath, method);
  }

  // For monitoring and IIS health checks.
  if (pathname === "/health") return Response.json({ ok: true });

  const found = route(pathname);
  if (!found) return notFound();

  const handler = found.module[method] ?? (method === "HEAD" ? found.module.GET : undefined);
  if (typeof handler !== "function") {
    const allowed = Object.keys(found.module).filter((name) => /^[A-Z]+$/.test(name));
    return Response.json({ message: "Method not allowed" }, { status: 405, headers: { Allow: allowed.join(", ") } });
  }
  return handler(request, { params: Promise.resolve(found.params) });
}
