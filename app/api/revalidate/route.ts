import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * On-demand cache invalidation.
 *
 * The admin UI will normally call `updateTag` directly from a Server Action,
 * which is better there because it gives the editor read-your-own-writes.
 * This endpoint covers the cases a Server Action cannot: external webhooks,
 * scripted content imports, and manually clearing a tag during development.
 *
 *   curl -X POST localhost:3000/api/revalidate \
 *     -H "content-type: application/json" \
 *     -d '{"secret":"...","tags":["divisions"]}'
 */

function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, so compare lengths first —
  // that leaks only the length, not the contents.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    // Fail closed. An unset secret must never mean "no auth required".
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { secret?: unknown; tags?: unknown; immediate?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof body.secret !== "string" || !secretMatches(body.secret, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (
    !Array.isArray(body.tags) ||
    body.tags.length === 0 ||
    !body.tags.every((t) => typeof t === "string" && t.length > 0)
  ) {
    return NextResponse.json(
      { error: "Provide a non-empty `tags` array of strings." },
      { status: 400 },
    );
  }

  const tags = body.tags as string[];

  /**
   * Default "max" is the recommended profile: visitors keep getting an instant
   * response from the stale copy while a fresh one builds behind them.
   *
   * `immediate: true` drops the stale window to zero instead. Use it when the
   * old content must stop being served at once rather than eventually — an
   * unpublish for legal or accuracy reasons, say — accepting that the next
   * request blocks while the page rebuilds.
   */
  const immediate = body.immediate === true;
  const profile = immediate ? { expire: 0 } : "max";

  for (const tag of tags) {
    revalidateTag(tag, profile);
  }

  return NextResponse.json({
    revalidated: tags,
    mode: immediate ? "immediate" : "stale-while-revalidate",
    at: Date.now(),
  });
}
