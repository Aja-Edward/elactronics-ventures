import { cacheLife, cacheTag } from "next/cache";

import { tags } from "./cache-tags";
import { db } from "./db";

/**
 * Just the banner image for a routed page.
 *
 * Kept separate from getPageBySlug so a route that only wants its banner does
 * not drag body and SEO copy it will never render into the query. Same cache
 * tags, so publishing a page invalidates the banner and the page together.
 *
 * Returns null for a slug with no Page row, an unpublished one, or one with no
 * hero set — all three mean the same thing to the caller: render the flat band.
 */
export async function getPageHero(slug: string) {
  "use cache";
  cacheTag(tags.pages(), tags.page(slug));
  cacheLife("days");

  const page = await db.page.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { heroImage: { select: { secureUrl: true, alt: true } } },
  });
  return page?.heroImage ?? null;
}

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
