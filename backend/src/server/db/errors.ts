/** Thrown by the database layer; route handlers turn it into an HTTP error response. */
export class DbError extends Error {
  constructor(
    readonly status: 404 | 409 | 422,
    message: string,
    /** Machine-readable reason, e.g. "slug_taken". */
    readonly code?: string,
    /** The input field it's about, so a form can point at it. */
    readonly field?: string,
  ) {
    super(message);
    this.name = "DbError";
  }
}

export const notFoundError = (what: string) => new DbError(404, `${what} not found`, "not_found");
