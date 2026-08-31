import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * OEM authorisations.
 *
 * A buyer's first question about a distributor is whether the authorisation is
 * real and current, so `authorisationRef` and the validity dates are selected
 * here and shown on the page rather than kept as internal-only fields.
 */
export async function getOemPartners() {
  "use cache";
  cacheTag(tags.oemPartners());
  cacheLife("days");

  return db.oemPartner.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      website: true,
      authorisationRef: true,
      authorisedUntil: true,
      logo: { select: { secureUrl: true, alt: true } },
    },
  });
}
