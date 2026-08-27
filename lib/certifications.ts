import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

export async function getPublishedCertifications() {
  "use cache";
  cacheTag(tags.certifications());
  cacheLife("days");

  // `lapsed` is computed here rather than at render time. Next refuses to
  // prerender an unstable value like `new Date()` outside a cache scope, and
  // this is the correct home for it anyway — whether a certificate is current
  // is a fact about the data, not a presentation detail. Recomputed with the
  // cache entry, so it can lag by at most a day.
  const now = new Date();

  const rows = await db.certification.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      issuer: true,
      reference: true,
      issuedAt: true,
      expiresAt: true,
      description: true,
      file: { select: { secureUrl: true, alt: true, width: true, height: true } },
    },
  });

  return rows.map((row: (typeof rows)[number]) => ({
    ...row,
    lapsed: Boolean(row.expiresAt && row.expiresAt < now),
  }));
}
