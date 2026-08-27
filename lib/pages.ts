import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/** Simple editorial pages (about, terms, privacy) keyed by slug. */
export async function getPageBySlug(slug: string) {
  "use cache";
  cacheTag(tags.pages(), tags.page(slug));
  cacheLife("days");

  return db.page.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, description: true, body: true,
      seoTitle: true, seoDescription: true,
      heroImage: { select: { secureUrl: true, alt: true } },
    },
  });
}
