/** A route file's exports: one handler per HTTP method, as in Next.js route handlers. */
export type RouteModule = Partial<Record<string, (request: Request, context: { params: Promise<RouteParams> }) => Promise<Response> | Response>>;
export type RouteParams = Record<string, string | string[]>;

type Segment = { kind: "static"; value: string } | { kind: "param"; name: string } | { kind: "rest"; name: string };

interface Route {
  segments: Segment[];
  module: RouteModule;
}

function parse(pattern: string): Segment[] {
  return pattern
    .split("/")
    .filter(Boolean)
    .map((part) => {
      const rest = /^\[\.\.\.(\w+)\]$/.exec(part);
      if (rest) return { kind: "rest", name: rest[1] };
      const param = /^\[(\w+)\]$/.exec(part);
      if (param) return { kind: "param", name: param[1] };
      return { kind: "static", value: part };
    });
}

const RANK = { static: 0, param: 1, rest: 2 } as const;

/** Fixed segments win over parameters (…/applications/stats before …/applications/[id]). */
function compare(a: Route, b: Route) {
  for (let i = 0; i < Math.max(a.segments.length, b.segments.length); i++) {
    const x = a.segments[i];
    const y = b.segments[i];
    if (!x || !y) return x ? 1 : -1;
    if (RANK[x.kind] !== RANK[y.kind]) return RANK[x.kind] - RANK[y.kind];
  }
  return 0;
}

function match(route: Route, parts: string[]): RouteParams | null {
  const params: RouteParams = {};
  for (let i = 0; i < route.segments.length; i++) {
    const segment = route.segments[i];
    if (segment.kind === "rest") {
      if (i >= parts.length) return null;
      params[segment.name] = parts.slice(i);
      return params;
    }
    const part = parts[i];
    if (part === undefined) return null;
    if (segment.kind === "static" && segment.value !== part) return null;
    if (segment.kind === "param") params[segment.name] = part;
  }
  return route.segments.length === parts.length ? params : null;
}

/** Finds the route file for a path, and the values of its [parameters]. */
export function createRouter(table: { pattern: string; module: RouteModule }[]) {
  const routes: Route[] = table.map((entry) => ({ segments: parse(entry.pattern), module: entry.module })).sort(compare);
  return (pathname: string) => {
    let parts: string[];
    try {
      parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
    } catch {
      return null;
    }
    for (const route of routes) {
      const params = match(route, parts);
      if (params) return { module: route.module, params };
    }
    return null;
  };
}
