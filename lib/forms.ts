import { headers } from "next/headers";

import { db } from "./db";
import { HONEYPOT_FIELD, MIN_FILL_MS, TIMESTAMP_FIELD } from "./form-constants";

/**
 * Shared protection for the public forms.
 *
 * These endpoints are unauthenticated and will be found by scrapers, so they
 * get three cheap defences rather than none:
 *
 *   1. A honeypot field, hidden from people but filled in by naive bots.
 *   2. A minimum fill time — a form completed in under a couple of seconds was
 *      not typed by a human.
 *   3. A per-IP rate limit counted in the database, so it holds across
 *      serverless instances where an in-memory counter would not.
 *
 * None of these stop a determined attacker. They stop the volume traffic that
 * otherwise fills the client's inbox with junk on day one.
 */

export { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "./form-constants";

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT = 5;

export type RequestMeta = { ipAddress: string | null; userAgent: string | null };

export async function getRequestMeta(): Promise<RequestMeta> {
  const list = await headers();
  return {
    // x-forwarded-for is a list; the first entry is the client on Vercel.
    ipAddress: list.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: list.get("user-agent"),
  };
}

/**
 * Returns a reason string when the submission looks automated, or null when
 * it looks human. Deliberately vague to the caller's user: telling a bot which
 * check it failed just helps it pass next time.
 */
export function detectBot(formData: FormData): string | null {
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return "honeypot";
  }

  const loadedAt = Number(formData.get(TIMESTAMP_FIELD));
  if (Number.isFinite(loadedAt) && loadedAt > 0) {
    const elapsed = Date.now() - loadedAt;
    if (elapsed < MIN_FILL_MS) return "too-fast";
  }

  return null;
}

export async function isRateLimited(ipAddress: string | null): Promise<boolean> {
  // No IP (local development, or a proxy that strips it) means we cannot
  // attribute submissions, so we do not block — better than locking out real
  // enquiries.
  if (!ipAddress) return false;

  const since = new Date(Date.now() - RATE_WINDOW_MS);

  const [quotes, contacts, partners] = await Promise.all([
    db.quoteRequest.count({ where: { ipAddress, createdAt: { gte: since } } }),
    db.contactSubmission.count({ where: { ipAddress, createdAt: { gte: since } } }),
    db.partnerApplication.count({ where: { ipAddress, createdAt: { gte: since } } }),
  ]);

  return quotes + contacts + partners >= RATE_LIMIT;
}

export const RATE_LIMIT_MESSAGE =
  "You have sent several messages recently. Please email us directly, or try again later.";
