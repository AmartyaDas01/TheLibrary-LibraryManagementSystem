import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";

const COOKIE_NAME = "library_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "the-library-dev-secret-change-me";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sign(value: string): string {
  const hmac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(value)
    .digest("hex");
  return `${value}.${hmac}`;
}

function unsign(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const expected = sign(value);
  // Constant-time comparison guards against timing attacks.
  if (
    expected.length === signed.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signed))
  ) {
    return value;
  }
  return null;
}

export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Reads and verifies the session, returning the current user (or null). */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const userId = unsign(raw);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
});

export function isLibrarian(user: { role: string } | null): boolean {
  return user?.role === ROLES.LIBRARIAN;
}
