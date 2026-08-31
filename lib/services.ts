import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";
import { SKID_GROUP } from "./service-groups";

/**
 * Services that sit outside any division.
 *
 * The schema groups these with `Service.group`; the skid-package systems are
 * the only group so far. They are their own top-level section on the reference
 * site rather than a child of a division, so they get their own reader instead
 * of being pulled off a Division record.
 */
export { SKID_GROUP } from "./service-groups";

export async function getSkidPackageServices() {
  "use cache";
  cacheTag(tags.services());
  cacheLife("days");

  return db.service.findMany({
    where: { group: SKID_GROUP, status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      heroImage: { select: { secureUrl: true, alt: true } },
    },
  });
}

export async function getSkidPackageServiceBySlug(slug: string) {
  "use cache";
  cacheTag(tags.services(), tags.service(slug));
  cacheLife("days");

  return db.service.findFirst({
    where: { slug, group: SKID_GROUP, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      body: true,
      seoTitle: true,
      seoDescription: true,
      heroImage: { select: { secureUrl: true, alt: true, width: true, height: true } },
    },
  });
}

/** Slugs for generateStaticParams. */
export async function getSkidPackageServiceSlugs() {
  "use cache";
  cacheTag(tags.services());
  cacheLife("days");

  const rows = await db.service.findMany({
    where: { group: SKID_GROUP, status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r: { slug: string }) => r.slug);
}
