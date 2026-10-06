import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_TOKEN_TTL = 15 * 60;
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

export type TokenType = "access" | "refresh";

export interface TokenClaims {
  /** User id. */
  sub: string;
  type: TokenType;
  /** The user's token_version when issued; a password change makes older tokens invalid. */
  ver: number;
  iat: number;
  exp: number;
}

let warned = false;

/** The signing key: AUTH_SECRET, required in production. */
function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters");
  }
  if (!warned) {
    console.warn("[auth] AUTH_SECRET is not set; using an insecure development key");
    warned = true;
  }
  return "spark-insecure-development-secret-change-me";
}

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

/** Signs an HS256 JWT. */
export function signToken(type: TokenType, userId: string, version: number, ttl: number) {
  const iat = Math.floor(Date.now() / 1000);
  const claims: TokenClaims = { sub: userId, type, ver: version, iat, exp: iat + ttl };
  const body = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(claims)}`;
  return `${body}.${sign(body)}`;
}

/** The token's claims when the signature is valid, it hasn't expired, and it's of `type`; otherwise null. */
export function verifyToken(token: string | null | undefined, type: TokenType): TokenClaims | null {
  const [header, payload, signature] = token?.split(".") ?? [];
  if (!header || !payload || !signature) return null;
  const expected = Buffer.from(sign(`${header}.${payload}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as TokenClaims;
    return claims.type === type && claims.exp > Date.now() / 1000 ? claims : null;
  } catch {
    return null;
  }
}
