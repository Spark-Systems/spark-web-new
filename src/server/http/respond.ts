import "server-only";

import { z } from "zod";

import { AuthError } from "@/server/auth";
import { DbError } from "@/server/db/errors";
import { ConflictError, ReadOnlyStorageError } from "@/server/storage";

export const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });

export const noContent = () => new Response(null, { status: 204 });

/** Error body every endpoint uses: `{ message, code?, field?, issues? }`. */
export const errorJson = (status: number, message: string, extra?: Record<string, unknown>) =>
  json({ message, ...extra }, status);

/** A request the handler rejects on purpose (bad input, wrong state). */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

/** Turns a thrown error into the matching JSON response. */
export function errorResponse(error: unknown): Response {
  if (error instanceof AuthError) return errorJson(error.status, error.message);
  if (error instanceof HttpError) return errorJson(error.status, error.message, { code: error.code });
  if (error instanceof DbError) return errorJson(error.status, error.message, { code: error.code, field: error.field });
  if (error instanceof z.ZodError) {
    return errorJson(422, "Some fields are invalid", {
      code: "validation",
      issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
  if (error instanceof ConflictError) return errorJson(409, error.message, { code: "conflict" });
  if (error instanceof ReadOnlyStorageError) return errorJson(503, error.message, { code: "read_only" });
  console.error("[api]", error);
  return errorJson(500, "Something went wrong");
}

/**
 * Wraps a route handler so thrown errors become JSON error responses.
 *
 * @example export const GET = handle(async (request) => json(await things()))
 */
export function handle<C = unknown>(handler: (request: Request, context: C) => Promise<Response>) {
  return async (request: Request, context: C) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Parses the JSON body with `schema` (a ZodError becomes a 422). */
export async function readBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "The request body must be JSON", "bad_json");
  }
  return schema.parse(body);
}
