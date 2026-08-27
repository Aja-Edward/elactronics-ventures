import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * Slug-rename redirects.
 *
 * Looked up only when a page is about to 404, so the cost falls on missing
 * URLs rather than on every request. That is why this lives here rather than
 * in proxy.ts — Next's docs are explicit that Proxy is not for data fetching,
 * and a database round trip on every request would be exactly that.
 */

export async function findRedirect(source: string) {
  "use cache";
  cacheTag(tags.redirects());
  cacheLife("days");

  return db.redirect.findUnique({
    where: { source },
    select: { destination: true, permanent: true },
  });
}

/**
 * Records that `from` has moved to `to`, and repairs any existing redirects
 * that pointed at the old location.
 *
 * Without that repair, renaming a slug twice (a -> b -> c) leaves the first
 * redirect pointing at `b`, which no longer resolves — so the oldest URL, the
 * one most likely to be indexed or linked, would 404. Chains are collapsed so
 * every historical URL points straight at the current one.
 */
export async function recordSlugChange(from: string, to: string) {
  if (from === to) return;

  await db.$transaction(async (tx: any) => {
    // Renaming back to a previously used slug would otherwise leave a row
    // redirecting the new location to itself.
    await tx.redirect.deleteMany({ where: { source: to } });

    // Repoint older redirects at the new destination.
    await tx.redirect.updateMany({
      where: { destination: from },
      data: { destination: to },
    });

    await tx.redirect.upsert({
      where: { source: from },
      create: {
        source: from,
        destination: to,
        permanent: true,
        note: "Created automatically on slug rename.",
      },
      update: { destination: to, permanent: true },
    });
  });
}
