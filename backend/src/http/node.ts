import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

/** Largest request body accepted (uploads and CVs are capped at 4 MB further in). */
const MAX_BODY_BYTES = 10 * 1024 * 1024;

/** Node's request as a standard web Request (what the route handlers take). */
function toRequest(req: IncomingMessage): Request {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
    else if (value !== undefined) headers.set(name, value);
  }
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  return new Request(url, {
    method,
    headers,
    body: hasBody ? (Readable.toWeb(req) as ReadableStream<Uint8Array>) : undefined,
    // Required by Node's fetch for a streamed body.
    duplex: "half",
  } as RequestInit);
}

/** Writes a web Response back through Node, keeping every Set-Cookie header. */
async function send(res: ServerResponse, response: Response) {
  const headers: Record<string, string | string[]> = {};
  response.headers.forEach((value, name) => {
    if (name !== "set-cookie") headers[name] = value;
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) headers["set-cookie"] = cookies;
  res.writeHead(response.status, headers);
  if (!response.body || res.req.method === "HEAD") {
    res.end();
    return;
  }
  await new Promise<void>((resolve, reject) => {
    Readable.fromWeb(response.body as import("node:stream/web").ReadableStream)
      .on("error", reject)
      .pipe(res)
      .on("finish", resolve)
      .on("error", reject);
  });
}

/** Adapts a fetch-style handler (Request in, Response out) to Node's http server. */
export function nodeHandler(handler: (request: Request) => Promise<Response>) {
  return (req: IncomingMessage, res: ServerResponse) => {
    const length = Number(req.headers["content-length"] ?? 0);
    const respond =
      length > MAX_BODY_BYTES
        ? Promise.resolve(Response.json({ message: "The request is too large" }, { status: 413 }))
        : handler(toRequest(req)).catch((error: unknown) => {
            console.error("[http]", error);
            return Response.json({ message: "Something went wrong" }, { status: 500 });
          });
    respond
      .then((response) => send(res, response))
      .catch((error: unknown) => {
        console.error("[http] sending the response failed", error);
        res.destroy();
      });
  };
}
