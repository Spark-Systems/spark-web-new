import type { User, UserRole } from "@/types/cms";
import { logActivity } from "@/server/db/activity";
import { newId, now, type Actor } from "@/server/db/ids";
import { publicUser, users, type StoredUser } from "@/server/db/users";
import { hashPassword, verifyPassword } from "./password";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, signToken, verifyToken } from "./tokens";

export { hashPassword } from "./password";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_expires_in: number;
}

/** A signed-in user, as route handlers see them. */
export interface Session {
  user: User;
  actor: Actor;
}

/** Thrown for a missing or invalid session (401) or a role that's too low (403). */
export class AuthError extends Error {
  constructor(readonly status: 401 | 403, message = status === 401 ? "Unauthorized" : "Forbidden") {
    super(message);
    this.name = "AuthError";
  }
}

const RANK: Record<UserRole, number> = { viewer: 0, editor: 1, admin: 2 };

/** Can someone with `role` do what needs `required`? (admin > editor > viewer) */
export const hasRole = (role: UserRole, required: UserRole) => RANK[role] >= RANK[required];

function issueTokens(user: StoredUser): AuthTokens {
  return {
    access_token: signToken("access", user.id, user.token_version, ACCESS_TOKEN_TTL),
    refresh_token: signToken("refresh", user.id, user.token_version, REFRESH_TOKEN_TTL),
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL,
    refresh_expires_in: REFRESH_TOKEN_TTL,
  };
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * With no users yet, the first sign-in with ADMIN_EMAIL / ADMIN_PASSWORD (from
 * the environment) creates that admin. After that the variables are ignored.
 */
async function bootstrapAdmin(email: string, password: string): Promise<StoredUser | null> {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !sameEmail(email, ADMIN_EMAIL) || password !== ADMIN_PASSWORD) return null;
  if ((await users.all()).length > 0) return null;
  return users.insert({
    id: newId("usr"),
    name: "Spark Admin",
    email: ADMIN_EMAIL.trim().toLowerCase(),
    role: "admin",
    avatar_url: null,
    created_at: now(),
    last_login_at: null,
    password_hash: await hashPassword(ADMIN_PASSWORD),
    token_version: 0,
  });
}

// Brute-force brake: a few failed sign-ins per email lock it out for a while.
// Kept in memory, so it's per server instance; enough to slow down guessing.
const FAILURE_LIMIT = 8;
const LOCKOUT_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; until: number }>();

function assertNotLocked(email: string) {
  const entry = failures.get(email);
  if (entry && entry.count >= FAILURE_LIMIT && entry.until > Date.now()) {
    throw new AuthError(401, "Too many failed attempts. Try again in a few minutes.");
  }
}

function recordFailure(email: string) {
  const entry = failures.get(email);
  const fresh = !entry || entry.until < Date.now();
  failures.set(email, { count: fresh ? 1 : entry.count + 1, until: Date.now() + LOCKOUT_MS });
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const key = email.trim().toLowerCase();
  assertNotLocked(key);
  const found = (await users.all()).find((u) => sameEmail(u.email, key));
  const user = found
    ? (await verifyPassword(password, found.password_hash)) && found
    : await bootstrapAdmin(key, password);
  if (!user) {
    recordFailure(key);
    throw new AuthError(401, "Invalid email or password");
  }
  failures.delete(key);
  const updated = await users.update(user.id, (u) => ({ ...u, last_login_at: now() }));
  await logActivity({ id: user.id, name: user.name }, "login", "auth", { id: user.id, label: user.email });
  return issueTokens(updated);
}

/** Exchanges a refresh token for a new pair. */
export async function refresh(refreshToken: string | undefined): Promise<AuthTokens> {
  const claims = verifyToken(refreshToken, "refresh");
  const user = claims && (await users.get(claims.sub));
  if (!claims || !user || user.token_version !== claims.ver) throw new AuthError(401);
  return issueTokens(user);
}

/** The user an access token belongs to, or null when it's invalid, expired or revoked. */
export async function userFromAccessToken(token: string | null | undefined): Promise<StoredUser | null> {
  const claims = verifyToken(token, "access");
  if (!claims) return null;
  const user = await users.get(claims.sub);
  return user && user.token_version === claims.ver ? user : null;
}

const bearer = (request: Request) => request.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];

/** The signed-in user of an API request (Authorization: Bearer). Throws AuthError when there's none or the role is too low. */
export async function requireSession(request: Request, role: UserRole = "viewer"): Promise<Session> {
  const user = await userFromAccessToken(bearer(request));
  if (!user) throw new AuthError(401);
  if (!hasRole(user.role, role)) throw new AuthError(403);
  return { user: publicUser(user), actor: { id: user.id, name: user.name } };
}

/** Sets a new password and signs out every other session (older tokens stop working). */
export async function changePassword(userId: string, currentPassword: string | null, newPassword: string) {
  const user = await users.get(userId);
  if (!user) throw new AuthError(401);
  if (currentPassword !== null && !(await verifyPassword(currentPassword, user.password_hash))) {
    throw new AuthError(403, "The current password is incorrect");
  }
  const hash = await hashPassword(newPassword);
  const updated = await users.update(userId, (u) => ({ ...u, password_hash: hash, token_version: u.token_version + 1 }));
  return issueTokens(updated);
}
