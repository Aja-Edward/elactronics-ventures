import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { db } from "./db";

/**
 * Session-based authentication for the admin.
 *
 * Design notes:
 *
 * - The cookie holds a 256-bit random token. The database stores only its
 *   SHA-256, so a database dump cannot be replayed as a live session. SHA-256
 *   (not bcrypt) is right here: the token is already high-entropy, so it is
 *   not brute-forceable, and lookups happen on every admin request.
 * - Login does a bcrypt comparison even when the email does not exist, so
 *   response timing does not reveal which addresses are registered.
 * - Sessions are absolute-expiry, not sliding. Simpler to reason about, and
 *   a stolen cookie cannot be kept alive indefinitely by using it.
 */

const SESSION_COOKIE = "elv_session";
const SESSION_TTL_DAYS = 7;

/** A bcrypt hash of a random string, used to burn time on unknown emails. */
const DUMMY_HASH = bcrypt.hashSync("unused-placeholder-value", 12);

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Always run a comparison, even with no user, to keep timing flat.
  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !matches || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function createSession(
  userId: string,
  meta?: { userAgent?: string | null; ipAddress?: string | null },
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);

  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: meta?.userAgent ?? null,
      ipAddress: meta?.ipAddress ?? null,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Secure in production only, so local http development still works.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

/**
 * Returns the signed-in user, or null. Reads the database on every call, so
 * deactivating a user or deleting a session takes effect immediately rather
 * than waiting for a token to expire.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  if (!session.user.isActive) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }

  store.delete(SESSION_COOKIE);
}

/** Roles allowed to publish or delete. EDITOR can draft but not publish. */
export function canPublish(role: SessionUser["role"]): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canManageUsers(role: SessionUser["role"]): boolean {
  return role === "SUPER_ADMIN";
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

/** Exported for tests; not used in the request path. */
export function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
