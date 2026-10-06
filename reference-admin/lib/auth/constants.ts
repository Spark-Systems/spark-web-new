// Shared by the browser token store and proxy.ts, so keep this file free of
// browser-only or server-only imports.
export const ACCESS_TOKEN_COOKIE = "spark_access_token"
export const REFRESH_TOKEN_COOKIE = "spark_refresh_token"

/** Used when the API doesn't send a refresh token lifetime. */
export const DEFAULT_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7

export const LOGIN_PATH = "/login"
export const HOME_PATH = "/dashboard"
